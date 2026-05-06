export const MUSCLE_GROUPS = [
    { id: 'pectoraux', name: 'Pectoraux', icon: '🫁', color: '#FF6B6B' },
    { id: 'dos', name: 'Dos', icon: '🔙', color: '#4ECDC4' },
    { id: 'epaules', name: 'Épaules', icon: '💪', color: '#45B7D1' },
    { id: 'biceps', name: 'Biceps', icon: '💪', color: '#96CEB4' },
    { id: 'triceps', name: 'Triceps', icon: '🦾', color: '#FFEAA7' },
    { id: 'jambes', name: 'Jambes', icon: '🦵', color: '#DDA0DD' },
    { id: 'abdominaux', name: 'Abdominaux', icon: '🎯', color: '#98D8C8' },
    { id: 'mollets', name: 'Mollets', icon: '🦶', color: '#F7DC6F' },
    { id: 'avant-bras', name: 'Avant-bras', icon: '🤜', color: '#BB8FCE' },
];

export const DEFAULT_EXERCISES = [
    // Pectoraux
    { name: 'Développé couché', muscle_group: 'pectoraux', description: 'Allongé sur un banc plat, pousser la barre vers le haut en partant de la poitrine.' },
    { name: 'Développé incliné', muscle_group: 'pectoraux', description: 'Comme le développé couché mais sur un banc incliné à 30-45° pour cibler le haut des pectoraux.' },
    { name: 'Développé décliné', muscle_group: 'pectoraux', description: 'Sur un banc décliné pour cibler le bas des pectoraux.' },
    { name: 'Écarté couché haltères', muscle_group: 'pectoraux', description: 'Allongé sur un banc, ouvrir les bras avec des haltères en arc de cercle.' },
    { name: 'Pec deck (machine)', muscle_group: 'pectoraux', description: 'Machine pour isoler les pectoraux en rapprochant les bras devant soi.' },
    { name: 'Pompes', muscle_group: 'pectoraux', description: 'Exercice au poids du corps, mains au sol, monter et descendre le corps.' },
    { name: 'Cross-over poulie', muscle_group: 'pectoraux', description: 'Debout entre deux poulies, croiser les bras devant soi.' },
    { name: 'Dips pectoraux', muscle_group: 'pectoraux', description: 'Aux barres parallèles, se pencher en avant pour cibler les pectoraux.' },

    // Dos
    { name: 'Tractions', muscle_group: 'dos', description: 'Se suspendre à une barre et se hisser jusqu\'au menton.' },
    { name: 'Rowing barre', muscle_group: 'dos', description: 'Penché en avant, tirer la barre vers le nombril.' },
    { name: 'Rowing haltère', muscle_group: 'dos', description: 'Un genou sur le banc, tirer l\'haltère vers la hanche.' },
    { name: 'Tirage vertical (lat pulldown)', muscle_group: 'dos', description: 'Assis à la machine, tirer la barre vers la poitrine.' },
    { name: 'Tirage horizontal (rowing machine)', muscle_group: 'dos', description: 'Assis, tirer la poignée vers le ventre.' },
    { name: 'Soulevé de terre', muscle_group: 'dos', description: 'Soulever la barre du sol en gardant le dos droit. Exercice complet.' },
    { name: 'Pull-over', muscle_group: 'dos', description: 'Allongé sur un banc, descendre un haltère derrière la tête en arc.' },
    { name: 'Face pull', muscle_group: 'dos', description: 'Tirer la corde de la poulie haute vers le visage.' },

    // Épaules
    { name: 'Développé militaire', muscle_group: 'epaules', description: 'Debout ou assis, pousser la barre au-dessus de la tête.' },
    { name: 'Développé haltères assis', muscle_group: 'epaules', description: 'Assis, pousser les haltères au-dessus de la tête.' },
    { name: 'Élévations latérales', muscle_group: 'epaules', description: 'Debout, lever les bras sur les côtés avec des haltères.' },
    { name: 'Élévations frontales', muscle_group: 'epaules', description: 'Lever les haltères devant soi, bras tendus.' },
    { name: 'Oiseau (rear delt fly)', muscle_group: 'epaules', description: 'Penché en avant, écarter les bras sur les côtés.' },
    { name: 'Shrugs', muscle_group: 'epaules', description: 'Hausser les épaules avec des haltères ou une barre pour les trapèzes.' },

    // Biceps
    { name: 'Curl barre', muscle_group: 'biceps', description: 'Debout, fléchir les bras en tenant la barre.' },
    { name: 'Curl haltères', muscle_group: 'biceps', description: 'Fléchir les bras en alternance avec des haltères.' },
    { name: 'Curl marteau', muscle_group: 'biceps', description: 'Curl avec prise neutre (paumes face à face) pour le brachial.' },
    { name: 'Curl concentré', muscle_group: 'biceps', description: 'Assis, coude sur la cuisse, fléchir un bras à la fois.' },
    { name: 'Curl pupitre (Larry Scott)', muscle_group: 'biceps', description: 'Bras en appui sur le pupitre, fléchir avec barre ou haltère.' },
    { name: 'Curl poulie basse', muscle_group: 'biceps', description: 'Curl debout à la poulie basse pour une tension continue.' },

    // Triceps
    { name: 'Extensions triceps poulie haute', muscle_group: 'triceps', description: 'Debout face à la poulie, pousser vers le bas en gardant les coudes fixes.' },
    { name: 'Dips triceps', muscle_group: 'triceps', description: 'Aux barres parallèles, corps droit, coudes serrés.' },
    { name: 'Barre au front (skull crusher)', muscle_group: 'triceps', description: 'Allongé, descendre la barre vers le front puis pousser.' },
    { name: 'Extension haltère au-dessus de la tête', muscle_group: 'triceps', description: 'Un haltère derrière la tête, extension du bras vers le haut.' },
    { name: 'Kickback triceps', muscle_group: 'triceps', description: 'Penché, tendre le bras vers l\'arrière avec un haltère.' },

    // Jambes
    { name: 'Squat barre', muscle_group: 'jambes', description: 'Barre sur les trapèzes, fléchir les genoux en gardant le dos droit.' },
    { name: 'Presse à cuisses', muscle_group: 'jambes', description: 'Assis à la machine, pousser la plate-forme avec les pieds.' },
    { name: 'Fentes', muscle_group: 'jambes', description: 'Avancer un pied, fléchir les deux genoux à 90°.' },
    { name: 'Leg extension', muscle_group: 'jambes', description: 'Assis, tendre les jambes pour isoler les quadriceps.' },
    { name: 'Leg curl', muscle_group: 'jambes', description: 'Allongé ou assis, fléchir les jambes pour les ischio-jambiers.' },
    { name: 'Hip thrust', muscle_group: 'jambes', description: 'Dos contre un banc, pousser les hanches vers le haut avec barre.' },
    { name: 'Squat bulgare', muscle_group: 'jambes', description: 'Un pied sur un banc derrière, fléchir la jambe avant.' },
    { name: 'Hack squat', muscle_group: 'jambes', description: 'Machine de squat avec le dos appuyé, cibler les quadriceps.' },
    { name: 'Soulevé de terre roumain', muscle_group: 'jambes', description: 'Jambes quasi tendues, descendre la barre le long des cuisses pour les ischio-jambiers.' },

    // Abdominaux
    { name: 'Crunch', muscle_group: 'abdominaux', description: 'Allongé, relever le buste en contractant les abdominaux.' },
    { name: 'Relevé de jambes suspendu', muscle_group: 'abdominaux', description: 'Suspendu à une barre, monter les jambes vers la poitrine.' },
    { name: 'Planche (gainage)', muscle_group: 'abdominaux', description: 'En appui sur les avant-bras, maintenir le corps droit.' },
    { name: 'Russian twist', muscle_group: 'abdominaux', description: 'Assis, pieds décollés, tourner le buste de gauche à droite avec un poids.' },
    { name: 'Ab wheel (roue abdominale)', muscle_group: 'abdominaux', description: 'À genoux, rouler la roue vers l\'avant puis revenir.' },
    { name: 'Crunch poulie haute', muscle_group: 'abdominaux', description: 'À genoux devant la poulie, fléchir le buste vers le sol.' },

    // Mollets
    { name: 'Mollets debout machine', muscle_group: 'mollets', description: 'Debout sur la machine, monter sur la pointe des pieds.' },
    { name: 'Mollets assis machine', muscle_group: 'mollets', description: 'Assis, poids sur les genoux, monter sur la pointe des pieds.' },
    { name: 'Mollets à la presse', muscle_group: 'mollets', description: 'À la presse à cuisses, pousser avec la pointe des pieds.' },
];

export const DEFAULT_REST_TIME = 90; // seconds
