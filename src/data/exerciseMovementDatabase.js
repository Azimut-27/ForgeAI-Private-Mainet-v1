export const slugifyExerciseName = (value = '') => (
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const createVideoAssets = (slug) => ({
  default: `/videos/exercises/${slug}.mp4`,
  strength: `/videos/exercises/${slug}-strength.mp4`,
  hypertrophy: `/videos/exercises/${slug}-hypertrophy.mp4`,
  power: `/videos/exercises/${slug}-power.mp4`
});

const createMovementProfile = (profile) => ({
  slug: slugifyExerciseName(profile.displayName),
  displayName: profile.displayName,
  category: profile.category,
  movementPattern: profile.movementPattern,
  primaryMuscles: profile.primaryMuscles,
  secondaryMuscles: profile.secondaryMuscles,
  stabilizers: profile.stabilizers,
  setupCues: profile.setupCues,
  executionCues: profile.executionCues,
  breathingCues: profile.breathingCues,
  commonMistakes: profile.commonMistakes,
  safetyTips: profile.safetyTips,
  tempoGuide: profile.tempoGuide,
  goalIntent: profile.goalIntent,
  coachingCues: profile.coachingCues,
  beginnerTips: profile.beginnerTips,
  advancedTips: profile.advancedTips,
  videoAssets: profile.videoAssets || createVideoAssets(slugifyExerciseName(profile.displayName)),
  thumbnail: null,
  difficulty: profile.difficulty,
  equipment: profile.equipment,
  alternatives: profile.alternatives
});

// Movement profiles are kept independent from workout generation so ForgeAI can
// later reuse them for camera form analysis, rep counting, tempo scoring,
// velocity tracking, wearables, and movement-quality scoring.
export const exerciseMovementDatabase = [
  createMovementProfile({
    displayName: 'Bench Press',
    category: 'Chest',
    movementPattern: 'Horizontal Press',
    primaryMuscles: ['Pectoralis Major'],
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    stabilizers: ['Upper Back', 'Rotator Cuff', 'Core'],
    setupCues: ['Plant the feet and create a stable base.', 'Set the shoulder blades down and back.', 'Stack wrists over the bar before unracking.'],
    executionCues: {
      descent: ['Lower toward the lower chest with tension.', 'Keep forearms organized beneath the bar.', 'Hold the upper back against the bench.'],
      ascent: ['Drive through the floor as the bar leaves the chest.', 'Press evenly and keep the bar path controlled.', 'Finish with control instead of losing rib position.']
    },
    breathingCues: ['Inhale and brace before the descent.', 'Exhale through the press after the sticking point.'],
    commonMistakes: ['Bouncing the bar off the chest.', 'Letting wrists fold backward.', 'Losing scapular tension as load rises.'],
    safetyTips: ['Use safeties or a spotter for heavy sets.', 'Keep shoulder position repeatable rep to rep.'],
    tempoGuide: 'Own the lowering phase, keep tension at the chest, then press with intent.',
    goalIntent: {
      buildMuscle: 'Control the eccentric and maximize chest tension.',
      strength: 'Prioritize force production and a stable bar path.',
      power: 'Accelerate the press while keeping the setup locked.'
    },
    coachingCues: ['Drive through the floor.', 'Keep upper-back tension.', 'Stack wrists and elbows.', 'Press with intent.'],
    beginnerTips: ['Start with a repeatable touch point.', 'Practice unracking without losing the shoulder set.'],
    advancedTips: ['Match leg drive timing to the press.', 'Use bar speed feedback when load gets heavy.'],
    videoAssets: {
      default: 'https://drive.google.com/file/d/17H4W3kk67PHeHX_Zz8i-NLpQToXtoxtP/preview',
      strength: 'https://drive.google.com/file/d/17H4W3kk67PHeHX_Zz8i-NLpQToXtoxtP/preview',
      hypertrophy: 'https://drive.google.com/file/d/17H4W3kk67PHeHX_Zz8i-NLpQToXtoxtP/preview',
      power: 'https://drive.google.com/file/d/17H4W3kk67PHeHX_Zz8i-NLpQToXtoxtP/preview'
    },
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Bench', 'Rack'],
    alternatives: ['Incline Dumbbell Press', 'Chest Press', 'Push-Up']
  }),
  createMovementProfile({
    displayName: 'Back Squat',
    category: 'Legs',
    movementPattern: 'Squat Pattern',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Adductors', 'Hamstrings'],
    stabilizers: ['Core', 'Upper Back', 'Spinal Erectors'],
    setupCues: ['Center the bar and lock the upper back.', 'Set feet for the stance you can own.', 'Brace before the descent.'],
    executionCues: {
      descent: ['Sit between the hips while knees track over toes.', 'Keep pressure through the whole foot.', 'Maintain the torso angle you established.'],
      ascent: ['Drive the floor away from the bottom.', 'Let hips and chest rise together.', 'Finish tall without overextending.']
    },
    breathingCues: ['Take a deep brace before each hard rep.', 'Release air only after the hardest range passes.'],
    commonMistakes: ['Collapsing into the bottom.', 'Losing midfoot balance.', 'Letting the upper back soften under load.'],
    safetyTips: ['Set rack safeties before hard working sets.', 'Choose depth you can control with position.'],
    tempoGuide: 'Use tempo to own depth, trunk stiffness, and rebound quality.',
    goalIntent: {
      buildMuscle: 'Create deep leg tension with controlled depth and consistent bracing.',
      strength: 'Keep pressure centered and turn the bottom into force output.',
      power: 'Descend under control, then accelerate up with intent.'
    },
    coachingCues: ['Brace before you move.', 'Knees track with toes.', 'Stay rooted through midfoot.', 'Chest and hips rise together.'],
    beginnerTips: ['Film the side view to learn balance.', 'Keep the first working loads technically quiet.'],
    advancedTips: ['Use pauses to audit bottom position.', 'Keep bracing quality identical on heavy singles.'],
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Rack'],
    alternatives: ['Front Squat', 'Leg Press', 'Bulgarian Split Squat']
  }),
  createMovementProfile({
    displayName: 'Deadlift',
    category: 'Posterior Chain',
    movementPattern: 'Hip Hinge',
    primaryMuscles: ['Gluteus Maximus', 'Hamstrings', 'Spinal Erectors'],
    secondaryMuscles: ['Quadriceps', 'Trapezius', 'Lats'],
    stabilizers: ['Grip', 'Core', 'Upper Back'],
    setupCues: ['Bring the bar close before you wedge in.', 'Brace and pull slack out of the bar.', 'Set lats so the bar stays connected.'],
    executionCues: {
      descent: ['Hinge back when returning the bar.', 'Keep the bar close to the legs.', 'Reset position if the start degrades.'],
      ascent: ['Push the floor away and keep the wedge.', 'Stand tall without leaning back.', 'Finish with hips and ribs stacked.']
    },
    breathingCues: ['Brace hard before the pull.', 'Exhale after lockout or once the rep is secure.'],
    commonMistakes: ['Jerking the bar from a loose start.', 'Letting the bar drift forward.', 'Hyperextending the finish.'],
    safetyTips: ['Keep start position repeatable before adding load.', 'Stop a set when brace or grip position fails.'],
    tempoGuide: 'Tempo controls the lowering phase and teaches bar proximity without killing pull intent.',
    goalIntent: {
      buildMuscle: 'Keep tension in the posterior chain and control the return.',
      strength: 'Build maximal force from a tight start position.',
      power: 'Keep the wedge and accelerate through the floor.'
    },
    coachingCues: ['Wedge before you pull.', 'Keep the bar close.', 'Push the floor away.', 'Finish stacked.'],
    beginnerTips: ['Learn the start position with submaximal reps.', 'Pause to reset rather than chasing fatigue.'],
    advancedTips: ['Use slack pull timing to sharpen heavy starts.', 'Watch bar drift as a fatigue signal.'],
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Plates'],
    alternatives: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Hip Thrust']
  }),
  createMovementProfile({
    displayName: 'Incline Dumbbell Press',
    category: 'Chest',
    movementPattern: 'Incline Press',
    primaryMuscles: ['Upper Pectoralis Major'],
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    stabilizers: ['Scapular Stabilizers', 'Core'],
    setupCues: ['Choose a moderate incline.', 'Set shoulder blades into the bench.', 'Start dumbbells over the upper chest line.'],
    executionCues: {
      descent: ['Lower with elbows tracking under the dumbbells.', 'Keep the chest lifted without flaring ribs.', 'Find a deep but controlled stretch.'],
      ascent: ['Drive dumbbells up and slightly inward.', 'Keep tension through the upper chest.', 'Finish without smashing the dumbbells together.']
    },
    breathingCues: ['Inhale into the lowering phase.', 'Exhale as the dumbbells clear the sticking range.'],
    commonMistakes: ['Using an incline that becomes a shoulder press.', 'Losing dumbbell control at the bottom.', 'Shortening range to chase load.'],
    safetyTips: ['Kick dumbbells into position with control.', 'Choose loads you can lower safely.'],
    tempoGuide: 'Use a calm lowering phase to own the stretch and press path.',
    goalIntent: {
      buildMuscle: 'Bias upper-chest tension through stretch and squeeze.',
      strength: 'Keep the press path stable under heavier dumbbells.',
      power: 'Move fast while keeping both shoulders organized.'
    },
    coachingCues: ['Own the stretch.', 'Press from the upper chest line.', 'Keep ribs quiet.', 'Control both bells.'],
    beginnerTips: ['Start with neutral control before aggressive loading.', 'Use the same bench angle each session.'],
    advancedTips: ['Use pauses in the stretch when hypertrophy is the priority.', 'Track left-right control as fatigue rises.'],
    videoAssets: {
      default: 'https://drive.google.com/file/d/1vePfh35M7faomESNzSZ2OQGu6LMUAWoo/preview',
      strength: 'https://drive.google.com/file/d/1vePfh35M7faomESNzSZ2OQGu6LMUAWoo/preview',
      hypertrophy: 'https://drive.google.com/file/d/1vePfh35M7faomESNzSZ2OQGu6LMUAWoo/preview',
      power: 'https://drive.google.com/file/d/1vePfh35M7faomESNzSZ2OQGu6LMUAWoo/preview'
    },
    difficulty: 'Beginner to Intermediate',
    equipment: ['Dumbbells', 'Incline Bench'],
    alternatives: ['Bench Press', 'Low Incline Press', 'Push-Up']
  }),
  createMovementProfile({
    displayName: 'Overhead Press',
    category: 'Shoulders',
    movementPattern: 'Vertical Press',
    primaryMuscles: ['Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    stabilizers: ['Core', 'Glutes', 'Upper Back'],
    setupCues: ['Stack ribs over pelvis.', 'Grip the bar just outside shoulders.', 'Create a stable glute and trunk brace.'],
    executionCues: {
      descent: ['Return the bar to the shoulder shelf under control.', 'Keep forearms under the bar.', 'Do not lose trunk position.'],
      ascent: ['Move the head through after the bar clears.', 'Press vertically with intent.', 'Finish stacked overhead.']
    },
    breathingCues: ['Brace before each press.', 'Exhale as the bar passes the forehead.'],
    commonMistakes: ['Turning the press into a standing incline.', 'Letting ribs flare hard.', 'Pressing around the face instead of a clean path.'],
    safetyTips: ['Use load you can lower to the shoulders cleanly.', 'Keep neck and shoulder range comfortable.'],
    tempoGuide: 'Control the return, then create crisp vertical force.',
    goalIntent: {
      buildMuscle: 'Keep deltoid tension high through a controlled return.',
      strength: 'Use a rigid trunk to express overhead force.',
      power: 'Press fast while maintaining a vertical path.'
    },
    coachingCues: ['Squeeze glutes.', 'Ribs stay stacked.', 'Bar travels close.', 'Finish tall.'],
    beginnerTips: ['Use a stance that makes bracing obvious.', 'Learn the bar path before loading hard.'],
    advancedTips: ['Use strict control to expose trunk leaks.', 'Coordinate breath and rep cadence on heavy work.'],
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    alternatives: ['Dumbbell Shoulder Press', 'Push Press', 'Landmine Press']
  }),
  createMovementProfile({
    displayName: 'Pull-Up',
    category: 'Back',
    movementPattern: 'Vertical Pull',
    primaryMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    stabilizers: ['Grip', 'Core', 'Lower Trapezius'],
    setupCues: ['Take a full grip and own the hang.', 'Brace the trunk before the pull.', 'Set shoulders without shrugging up.'],
    executionCues: {
      descent: ['Lower until a controlled long position.', 'Keep the ribs organized.', 'Maintain shoulder control into the hang.'],
      ascent: ['Drive elbows down toward the ribs.', 'Bring chest toward the bar path.', 'Finish without craning the neck.']
    },
    breathingCues: ['Inhale at the long position.', 'Exhale through the pull.'],
    commonMistakes: ['Kicking for reps that should be strict.', 'Leading with the chin.', 'Dropping into a loose bottom position.'],
    safetyTips: ['Use assistance before range becomes sloppy.', 'Respect shoulder comfort in the bottom hang.'],
    tempoGuide: 'Tempo turns the pull-up into a lat and trunk control drill.',
    goalIntent: {
      buildMuscle: 'Maximize lat tension through a full controlled range.',
      strength: 'Treat every rep like a strong vertical pull.',
      power: 'Pull aggressively while keeping body line controlled.'
    },
    coachingCues: ['Elbows to ribs.', 'Own the hang.', 'Chest follows the pull.', 'Stay long through the trunk.'],
    beginnerTips: ['Use bands or assistance to earn full range.', 'Practice controlled eccentrics.'],
    advancedTips: ['Add load only if bottom control stays clean.', 'Use pauses to sharpen scapular control.'],
    difficulty: 'Intermediate',
    equipment: ['Pull-Up Bar'],
    alternatives: ['Lat Pulldown', 'Chin-Up', 'Assisted Pull-Up']
  }),
  createMovementProfile({
    displayName: 'Barbell Row',
    category: 'Back',
    movementPattern: 'Horizontal Pull',
    primaryMuscles: ['Latissimus Dorsi', 'Mid Back'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids'],
    stabilizers: ['Hamstrings', 'Spinal Erectors', 'Grip'],
    setupCues: ['Hinge into a repeatable torso angle.', 'Brace before the first pull.', 'Let arms start long without losing back tension.'],
    executionCues: {
      descent: ['Lower the bar under control to full reach.', 'Hold torso angle instead of chasing momentum.', 'Keep tension in the hinge.'],
      ascent: ['Pull toward the lower ribs.', 'Lead with elbows, not wrists.', 'Squeeze the back without jerking the trunk.']
    },
    breathingCues: ['Brace through the pull.', 'Breathe between reps when the hinge stays stable.'],
    commonMistakes: ['Standing taller each rep.', 'Using lower-back swing for the pull.', 'Shrugging instead of rowing.'],
    safetyTips: ['Use straps only if grip masks back work.', 'Reduce load when torso position fails.'],
    tempoGuide: 'A measured return keeps the row from becoming a hip extension.',
    goalIntent: {
      buildMuscle: 'Keep back tension and long reach in every rep.',
      strength: 'Lock the hinge and pull heavy with clean control.',
      power: 'Explode into the row while protecting torso position.'
    },
    coachingCues: ['Hold the hinge.', 'Elbows pull back.', 'Reach then row.', 'Keep the bar close.'],
    beginnerTips: ['Use a lighter load to learn torso control.', 'Pause at the top to feel the back.'],
    advancedTips: ['Match torso angle across sets.', 'Use straps selectively for back-biased volume.'],
    difficulty: 'Intermediate',
    equipment: ['Barbell'],
    alternatives: ['Chest Supported Row', 'Dumbbell Row', 'Cable Row']
  }),
  createMovementProfile({
    displayName: 'Barbell Curl',
    category: 'Arms',
    movementPattern: 'Elbow Flexion',
    primaryMuscles: ['Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
    stabilizers: ['Core', 'Forearms', 'Anterior Deltoids'],
    setupCues: ['Stand tall with ribs stacked.', 'Grip the bar evenly.', 'Keep elbows slightly in front of the torso without drifting.'],
    executionCues: {
      descent: ['Lower the bar under control to full elbow extension.', 'Keep shoulders quiet.', 'Do not let the bar pull posture forward.'],
      ascent: ['Curl with the elbows fixed.', 'Squeeze the biceps at the top.', 'Avoid turning the rep into a hip swing.']
    },
    breathingCues: ['Inhale as the bar lowers.', 'Exhale through the curl.'],
    commonMistakes: ['Swinging the hips to start the rep.', 'Letting elbows travel far forward.', 'Cutting the bottom range short.'],
    safetyTips: ['Use a grip width that feels clean on elbows and wrists.', 'Reduce load if the lower back starts helping.'],
    tempoGuide: 'Control the eccentric and keep constant arm tension instead of chasing momentum.',
    goalIntent: {
      buildMuscle: 'Keep biceps tension high with controlled range and a hard squeeze.',
      strength: 'Use strict posture and progressive loading without body English.',
      power: 'Move the curl crisply while keeping the torso fixed.'
    },
    coachingCues: ['Elbows stay organized.', 'Curl without swinging.', 'Control the lower.', 'Squeeze the top.'],
    beginnerTips: ['Start lighter than expected and own full range.', 'Use the same grip width every set.'],
    advancedTips: ['Use pauses near the top to remove momentum.', 'Track elbow position across fatigue.'],
    videoAssets: {
      default: 'https://drive.google.com/file/d/1zpGTxdJZZmP8M79NQHZpHxNBKy3BSohQ/preview',
      strength: 'https://drive.google.com/file/d/1zpGTxdJZZmP8M79NQHZpHxNBKy3BSohQ/preview',
      hypertrophy: 'https://drive.google.com/file/d/1zpGTxdJZZmP8M79NQHZpHxNBKy3BSohQ/preview',
      power: 'https://drive.google.com/file/d/1zpGTxdJZZmP8M79NQHZpHxNBKy3BSohQ/preview'
    },
    difficulty: 'Beginner to Intermediate',
    equipment: ['Barbell'],
    alternatives: ['Dumbbell Curl', 'EZ-Bar Curl', 'Preacher Curl']
  }),
  createMovementProfile({
    displayName: 'Bulgarian Split Squat',
    category: 'Legs',
    movementPattern: 'Single-Leg Squat',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Adductors', 'Hamstrings'],
    stabilizers: ['Foot Intrinsics', 'Core', 'Hip Stabilizers'],
    setupCues: ['Set front foot far enough to own depth.', 'Place the rear foot without overreaching.', 'Square the pelvis before descending.'],
    executionCues: {
      descent: ['Drop straight down into the front leg.', 'Keep front foot pressure stable.', 'Let the knee travel naturally with control.'],
      ascent: ['Drive through the front leg.', 'Keep pelvis level as you rise.', 'Finish tall without shifting backward.']
    },
    breathingCues: ['Inhale into the descent.', 'Exhale through the drive out of the bottom.'],
    commonMistakes: ['Pushing too much from the back leg.', 'Losing front-foot balance.', 'Shortening depth when fatigue hits.'],
    safetyTips: ['Use support when balance limits leg effort.', 'Select loads you can lower with control.'],
    tempoGuide: 'Slow eccentrics make single-leg alignment and depth obvious.',
    goalIntent: {
      buildMuscle: 'Drive high local leg tension with a deep controlled range.',
      strength: 'Own unilateral force and stable positions.',
      power: 'Keep the descent quiet and drive out hard.'
    },
    coachingCues: ['Front leg owns the rep.', 'Stay square.', 'Pressure through the foot.', 'Drive up cleanly.'],
    beginnerTips: ['Use bodyweight and support first.', 'Adjust stance before adding load.'],
    advancedTips: ['Bias knee or hip travel to match the target.', 'Use pauses to keep the front leg honest.'],
    difficulty: 'Intermediate',
    equipment: ['Bench', 'Dumbbells Optional'],
    alternatives: ['Reverse Lunge', 'Split Squat', 'Leg Press']
  }),
  createMovementProfile({
    displayName: 'Romanian Deadlift',
    category: 'Posterior Chain',
    movementPattern: 'Hip Hinge',
    primaryMuscles: ['Hamstrings', 'Gluteus Maximus'],
    secondaryMuscles: ['Spinal Erectors', 'Adductors'],
    stabilizers: ['Lats', 'Grip', 'Core'],
    setupCues: ['Start tall with soft knees.', 'Pin the bar close to the thighs.', 'Brace before hips travel back.'],
    executionCues: {
      descent: ['Reach hips back while the bar stays close.', 'Stop when hamstring tension peaks without losing position.', 'Keep shins quiet.'],
      ascent: ['Drive hips through without leaning back.', 'Keep lats connected to the bar.', 'Finish tall and stacked.']
    },
    breathingCues: ['Inhale and brace into the hinge.', 'Exhale as hips return through.'],
    commonMistakes: ['Chasing depth by rounding.', 'Turning the rep into a squat.', 'Letting the bar drift away.'],
    safetyTips: ['Range follows hamstring control, not the floor.', 'Keep loading honest when fatigue rises.'],
    tempoGuide: 'Tempo makes hinge tension, bar path, and hamstring length precise.',
    goalIntent: {
      buildMuscle: 'Load the hamstrings through a long controlled stretch.',
      strength: 'Build hinge force with uncompromised trunk position.',
      power: 'Use snap through the hips without losing tension.'
    },
    coachingCues: ['Hips travel back.', 'Bar brushes the legs.', 'Hamstrings load first.', 'Finish stacked.'],
    beginnerTips: ['Use a shortened range until hinge shape is clear.', 'Think hips back, not bar down.'],
    advancedTips: ['Use pauses near peak hamstring tension.', 'Track grip and lat tension during long sets.'],
    difficulty: 'Beginner to Intermediate',
    equipment: ['Barbell'],
    alternatives: ['Deadlift', 'Dumbbell RDL', 'Hip Thrust']
  }),
  createMovementProfile({
    displayName: 'Lat Pulldown',
    category: 'Back',
    movementPattern: 'Vertical Pull',
    primaryMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Teres Major', 'Mid Back'],
    stabilizers: ['Core', 'Scapular Stabilizers'],
    setupCues: ['Lock thighs under the pad.', 'Take a grip you can depress with control.', 'Start tall before the pull.'],
    executionCues: {
      descent: ['Return the cable to a long controlled reach.', 'Keep shoulders organized overhead.', 'Avoid losing rib position.'],
      ascent: ['Drive elbows down and slightly in.', 'Pull toward the upper chest line.', 'Finish with lat tension, not a body swing.']
    },
    breathingCues: ['Inhale into the overhead reach.', 'Exhale as elbows drive down.'],
    commonMistakes: ['Leaning back to move more stack weight.', 'Shrugging through the pull.', 'Cutting the long position short.'],
    safetyTips: ['Choose a grip comfortable for shoulders.', 'Control the stack on the return.'],
    tempoGuide: 'The return phase teaches reach without sacrificing shoulder control.',
    goalIntent: {
      buildMuscle: 'Keep the lats loaded from stretch to finish.',
      strength: 'Pull with stable trunk and repeatable elbow path.',
      power: 'Drive the pull fast while keeping the torso quiet.'
    },
    coachingCues: ['Elbows descend.', 'Stay tall.', 'Reach with control.', 'Finish with lats.'],
    beginnerTips: ['Learn shoulder depression before adding stack load.', 'Use full repeatable range.'],
    advancedTips: ['Match grip to lat line of pull.', 'Use pauses at the bottom for precision.'],
    difficulty: 'Beginner',
    equipment: ['Cable Pulldown'],
    alternatives: ['Pull-Up', 'Assisted Pull-Up', 'Single-Arm Pulldown']
  })
];

const profilesBySlug = Object.fromEntries(exerciseMovementDatabase.map(profile => [profile.slug, profile]));

export const getMovementProfileBySlug = (slug = '') => profilesBySlug[slugifyExerciseName(slug)] || null;

export const getMovementProfileByName = (exerciseName = '') => getMovementProfileBySlug(slugifyExerciseName(exerciseName));

export const createFallbackMovementProfile = (exerciseName = 'Exercise') => ({
  slug: slugifyExerciseName(exerciseName) || 'movement',
  displayName: exerciseName || 'Exercise',
  category: 'Movement Profile',
  movementPattern: 'ForgeAI Movement',
  primaryMuscles: [],
  secondaryMuscles: [],
  stabilizers: [],
  setupCues: ['Set a stable position before the first rep.', 'Choose a range you can control.'],
  executionCues: {
    descent: ['Control the loading phase.', 'Keep the target pattern organized.'],
    ascent: ['Move with intent.', 'Finish each rep in a repeatable position.']
  },
  breathingCues: ['Brace before demanding reps.', 'Use breathing to keep rhythm and control.'],
  commonMistakes: ['Rushing positions for load.', 'Losing tempo as fatigue rises.'],
  safetyTips: ['Movement profile coming soon. Use the programmed cues and stay inside clean technique.'],
  tempoGuide: 'Use the workout tempo to control the rep and maintain tension.',
  goalIntent: {
    buildMuscle: 'Create controlled muscular tension through the programmed range.',
    strength: 'Prioritize stable positions and strong force output.',
    power: 'Move with speed only while control stays sharp.'
  },
  coachingCues: ['Control the rep.', 'Own your setup.', 'Move with intent.'],
  beginnerTips: ['Keep the first sets clean and repeatable.'],
  advancedTips: ['Use feedback from load, tempo, and positioning.'],
  videoAssets: createVideoAssets(slugifyExerciseName(exerciseName) || 'movement'),
  thumbnail: null,
  difficulty: 'Varies',
  equipment: ['Varies'],
  alternatives: []
});
