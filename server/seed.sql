-- ============================================
-- SETROW DATABASE SCHEMA (Supabase / PostgreSQL)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_exercises_muscle ON exercises(muscle_group);
CREATE INDEX idx_exercises_created_by ON exercises(created_by);

-- ============================================
-- EXERCISE FAVORITES (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, exercise_id)
);

-- ============================================
-- ROUTINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  rest_time_seconds INTEGER DEFAULT 90,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_routines_user ON routines(user_id);

-- ============================================
-- ROUTINE EXERCISES (exercises in a routine)
-- ============================================
CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  target_sets INTEGER DEFAULT 4,
  target_reps INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_routine_exercises_routine ON routine_exercises(routine_id);

-- ============================================
-- SESSIONS TABLE (workout sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_started ON sessions(started_at);

-- ============================================
-- SESSION EXERCISES (exercises done in a session)
-- ============================================
CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);

-- ============================================
-- SETS TABLE (individual sets)
-- ============================================
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight NUMERIC(6,2) DEFAULT 0,
  reps INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sets_session_exercise ON sets(session_exercise_id);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  weight NUMERIC(5,2),
  height NUMERIC(5,2),
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- WEIGHT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC(5,2) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_weight_logs_user ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(logged_at);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  target_weight NUMERIC(6,2) DEFAULT 0,
  target_reps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goals_user ON goals(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Exercises: visible to all, custom only by creator
CREATE POLICY "Exercises visible to all" ON exercises FOR SELECT USING (
  created_by IS NULL OR created_by = auth.uid()
);
CREATE POLICY "Users can create custom exercises" ON exercises FOR INSERT WITH CHECK (
  created_by = auth.uid()
);
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (
  created_by = auth.uid()
);

-- Favorites: per user
CREATE POLICY "User favorites" ON exercise_favorites USING (user_id = auth.uid());
CREATE POLICY "User add favorites" ON exercise_favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User remove favorites" ON exercise_favorites FOR DELETE USING (user_id = auth.uid());

-- Routines, Sessions, Profiles, Goals, Weight logs: per user
CREATE POLICY "User routines" ON routines USING (user_id = auth.uid());
CREATE POLICY "User insert routines" ON routines FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update routines" ON routines FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User delete routines" ON routines FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "User routine exercises" ON routine_exercises USING (
  routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
);
CREATE POLICY "User insert routine exercises" ON routine_exercises FOR INSERT WITH CHECK (
  routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
);
CREATE POLICY "User delete routine exercises" ON routine_exercises FOR DELETE USING (
  routine_id IN (SELECT id FROM routines WHERE user_id = auth.uid())
);

CREATE POLICY "User sessions" ON sessions USING (user_id = auth.uid());
CREATE POLICY "User insert sessions" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update sessions" ON sessions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "User session exercises" ON session_exercises USING (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);
CREATE POLICY "User insert session exercises" ON session_exercises FOR INSERT WITH CHECK (
  session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
);

CREATE POLICY "User sets" ON sets USING (
  session_exercise_id IN (
    SELECT se.id FROM session_exercises se 
    JOIN sessions s ON s.id = se.session_id 
    WHERE s.user_id = auth.uid()
  )
);
CREATE POLICY "User insert sets" ON sets FOR INSERT WITH CHECK (
  session_exercise_id IN (
    SELECT se.id FROM session_exercises se 
    JOIN sessions s ON s.id = se.session_id 
    WHERE s.user_id = auth.uid()
  )
);
CREATE POLICY "User update sets" ON sets FOR UPDATE USING (
  session_exercise_id IN (
    SELECT se.id FROM session_exercises se 
    JOIN sessions s ON s.id = se.session_id 
    WHERE s.user_id = auth.uid()
  )
);

CREATE POLICY "User profile" ON profiles USING (user_id = auth.uid());
CREATE POLICY "User insert profile" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update profile" ON profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "User weight logs" ON weight_logs USING (user_id = auth.uid());
CREATE POLICY "User insert weight logs" ON weight_logs FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "User goals" ON goals USING (user_id = auth.uid());
CREATE POLICY "User insert goals" ON goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User update goals" ON goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User delete goals" ON goals FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SEED: DEFAULT EXERCISES
-- ============================================
INSERT INTO exercises (name, muscle_group, description, is_custom, created_by) VALUES
-- Pectoraux
('Développé couché', 'pectoraux', 'Allongé sur un banc plat, pousser la barre vers le haut en partant de la poitrine.', false, NULL),
('Développé incliné', 'pectoraux', 'Comme le développé couché mais sur un banc incliné à 30-45° pour cibler le haut des pectoraux.', false, NULL),
('Développé décliné', 'pectoraux', 'Sur un banc décliné pour cibler le bas des pectoraux.', false, NULL),
('Écarté couché haltères', 'pectoraux', 'Allongé sur un banc, ouvrir les bras avec des haltères en arc de cercle.', false, NULL),
('Pec deck (machine)', 'pectoraux', 'Machine pour isoler les pectoraux en rapprochant les bras devant soi.', false, NULL),
('Pompes', 'pectoraux', 'Exercice au poids du corps, mains au sol, monter et descendre le corps.', false, NULL),
('Cross-over poulie', 'pectoraux', 'Debout entre deux poulies, croiser les bras devant soi.', false, NULL),
('Dips pectoraux', 'pectoraux', 'Aux barres parallèles, se pencher en avant pour cibler les pectoraux.', false, NULL),
-- Dos
('Tractions', 'dos', 'Se suspendre à une barre et se hisser jusqu''au menton.', false, NULL),
('Rowing barre', 'dos', 'Penché en avant, tirer la barre vers le nombril.', false, NULL),
('Rowing haltère', 'dos', 'Un genou sur le banc, tirer l''haltère vers la hanche.', false, NULL),
('Tirage vertical (lat pulldown)', 'dos', 'Assis à la machine, tirer la barre vers la poitrine.', false, NULL),
('Tirage horizontal (rowing machine)', 'dos', 'Assis, tirer la poignée vers le ventre.', false, NULL),
('Soulevé de terre', 'dos', 'Soulever la barre du sol en gardant le dos droit. Exercice complet.', false, NULL),
('Pull-over', 'dos', 'Allongé sur un banc, descendre un haltère derrière la tête en arc.', false, NULL),
('Face pull', 'dos', 'Tirer la corde de la poulie haute vers le visage.', false, NULL),
-- Épaules
('Développé militaire', 'epaules', 'Debout ou assis, pousser la barre au-dessus de la tête.', false, NULL),
('Développé haltères assis', 'epaules', 'Assis, pousser les haltères au-dessus de la tête.', false, NULL),
('Élévations latérales', 'epaules', 'Debout, lever les bras sur les côtés avec des haltères.', false, NULL),
('Élévations frontales', 'epaules', 'Lever les haltères devant soi, bras tendus.', false, NULL),
('Oiseau (rear delt fly)', 'epaules', 'Penché en avant, écarter les bras sur les côtés.', false, NULL),
('Shrugs', 'epaules', 'Hausser les épaules avec des haltères ou une barre pour les trapèzes.', false, NULL),
-- Biceps
('Curl barre', 'biceps', 'Debout, fléchir les bras en tenant la barre.', false, NULL),
('Curl haltères', 'biceps', 'Fléchir les bras en alternance avec des haltères.', false, NULL),
('Curl marteau', 'biceps', 'Curl avec prise neutre (paumes face à face) pour le brachial.', false, NULL),
('Curl concentré', 'biceps', 'Assis, coude sur la cuisse, fléchir un bras à la fois.', false, NULL),
('Curl pupitre (Larry Scott)', 'biceps', 'Bras en appui sur le pupitre, fléchir avec barre ou haltère.', false, NULL),
('Curl poulie basse', 'biceps', 'Curl debout à la poulie basse pour une tension continue.', false, NULL),
-- Triceps
('Extensions triceps poulie haute', 'triceps', 'Debout face à la poulie, pousser vers le bas en gardant les coudes fixes.', false, NULL),
('Dips triceps', 'triceps', 'Aux barres parallèles, corps droit, coudes serrés.', false, NULL),
('Barre au front (skull crusher)', 'triceps', 'Allongé, descendre la barre vers le front puis pousser.', false, NULL),
('Extension haltère au-dessus de la tête', 'triceps', 'Un haltère derrière la tête, extension du bras vers le haut.', false, NULL),
('Kickback triceps', 'triceps', 'Penché, tendre le bras vers l''arrière avec un haltère.', false, NULL),
-- Jambes
('Squat barre', 'jambes', 'Barre sur les trapèzes, fléchir les genoux en gardant le dos droit.', false, NULL),
('Presse à cuisses', 'jambes', 'Assis à la machine, pousser la plate-forme avec les pieds.', false, NULL),
('Fentes', 'jambes', 'Avancer un pied, fléchir les deux genoux à 90°.', false, NULL),
('Leg extension', 'jambes', 'Assis, tendre les jambes pour isoler les quadriceps.', false, NULL),
('Leg curl', 'jambes', 'Allongé ou assis, fléchir les jambes pour les ischio-jambiers.', false, NULL),
('Hip thrust', 'jambes', 'Dos contre un banc, pousser les hanches vers le haut avec barre.', false, NULL),
('Squat bulgare', 'jambes', 'Un pied sur un banc derrière, fléchir la jambe avant.', false, NULL),
('Hack squat', 'jambes', 'Machine de squat avec le dos appuyé, cibler les quadriceps.', false, NULL),
('Soulevé de terre roumain', 'jambes', 'Jambes quasi tendues, descendre la barre le long des cuisses pour les ischio-jambiers.', false, NULL),
-- Abdominaux
('Crunch', 'abdominaux', 'Allongé, relever le buste en contractant les abdominaux.', false, NULL),
('Relevé de jambes suspendu', 'abdominaux', 'Suspendu à une barre, monter les jambes vers la poitrine.', false, NULL),
('Planche (gainage)', 'abdominaux', 'En appui sur les avant-bras, maintenir le corps droit.', false, NULL),
('Russian twist', 'abdominaux', 'Assis, pieds décollés, tourner le buste de gauche à droite avec un poids.', false, NULL),
('Ab wheel (roue abdominale)', 'abdominaux', 'À genoux, rouler la roue vers l''avant puis revenir.', false, NULL),
('Crunch poulie haute', 'abdominaux', 'À genoux devant la poulie, fléchir le buste vers le sol.', false, NULL),
-- Mollets
('Mollets debout machine', 'mollets', 'Debout sur la machine, monter sur la pointe des pieds.', false, NULL),
('Mollets assis machine', 'mollets', 'Assis, poids sur les genoux, monter sur la pointe des pieds.', false, NULL),
('Mollets à la presse', 'mollets', 'À la presse à cuisses, pousser avec la pointe des pieds.', false, NULL);
