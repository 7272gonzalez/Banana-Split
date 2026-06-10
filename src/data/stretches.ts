import { Routine } from '../types';

export const ROUTINES: Routine[] = [
  {
    id: 'front-split-prep',
    name: 'Front Splits Prep',
    description: 'A gentle beginner routine targeting hamstrings and hip flexors for daily split progress.',
    durationMinutes: 9,
    level: 'Beginner',
    focus: 'Front Split',
    bananaMultiplier: 1.5,
    stretches: [
      {
        id: 'fs-1',
        name: 'Low Lunge (Left Side Setup)',
        target: 'Hip flexors of the right leg to prepare for splits.',
        duration: 45,
        tips: 'Keep your chest tall and shoulders rolled down. Press your hips downwards gently without bouncing. Your left knee should stay behind or over your ankle, not past your toes.',
        instructions: [
          'Step your left foot forward between your palms.',
          'Lower your right knee to the floor, sliding it backward until you feel a comfortable stretch in your right hip flexor.',
          'Inhale to lift your torso upright, placing hands on your left thigh.',
          'Settle into the stretch with deep, steady belly breaths.'
        ],
        illustrationType: 'low-lunge'
      },
      {
        id: 'fs-2',
        name: 'Low Lunge (Right Side Setup)',
        target: 'Hip flexors (psoas) of the left leg.',
        duration: 45,
        tips: 'Keep your tailbone tucked slightly to feel a deeper stretch in the front of your left hip. Avoid arching your lower back extreme amounts.',
        instructions: [
          'Step your right foot forward between your hands.',
          'Lower your left knee to the floor, sliding it backward.',
          'Lift your torso up, placing your hands on your right knee.',
          'Breathe deeply as your hips sink towards the floor.'
        ],
        illustrationType: 'low-lunge'
      },
      {
        id: 'fs-3',
        name: 'Half Split Fold (Left Hamstring)',
        target: 'Hamstrings and calves on the left leg.',
        duration: 60,
        tips: 'Keep your right hip stacked directly over your right knee. Flex your left toes up towards the sky and try to hinge from your hips with a flat back, rather than rounding your upper shoulders.',
        instructions: [
          'From low lunge on the left, shift your weight back so your hips align over your right knee.',
          'Straighten your left leg, flexing your left foot back towards your face.',
          'Place hands on the floor or block on either side of your leg.',
          'With a long spine, gently fold your belly towards your left thigh.'
        ],
        illustrationType: 'half-split'
      },
      {
        id: 'fs-4',
        name: 'Half Split Fold (Right Hamstring)',
        target: 'Hamstrings and calves on the right leg.',
        duration: 60,
        tips: 'Engage your quadricep (thigh) of the straight leg to naturally release the hamstring. Keep your breathing continuous & relaxing.',
        instructions: [
          'Shift your hips back over your left knee.',
          'Extend your right leg long, flexing your toes up.',
          'Inhale to lengthen your spine, exhale to hinge forward over your right leg.',
          'Support yourself with hands on blocks or the ground.'
        ],
        illustrationType: 'half-split'
      },
      {
        id: 'fs-5',
        name: 'Kneeling Quad Stretch (Left Quad / Right Hip)',
        target: 'Front thigh and hip stretch.',
        duration: 45,
        tips: 'If this hurts your back knee, double up your yoga mat or slide a thin pillow underneath. Use your hand to pull your heel in line with your sit bones.',
        instructions: [
          'Enter a low lunge with your left foot forward and right knee down.',
          'Reaching back with your left hand, bend your right knee and capture your right foot or ankle.',
          'Gently draw your right heel closer to your buttocks.',
          'Keep your chest searching forward and upward.'
        ],
        illustrationType: 'kneeling-quad-right'
      },
      {
        id: 'fs-6',
        name: 'Kneeling Quad Stretch (Right Quad / Left Hip)',
        target: 'Stretch for the left thigh.',
        duration: 45,
        tips: 'Hold onto a wall or a chair with your free hand for stability if you feel shaky.',
        instructions: [
          'Enter a low lunge with your right foot forward and left knee down.',
          'Reach back with your right hand, bend your left knee and grasp your foot.',
          'Draw the foot in while letting your hips sink forward.',
          'Exhale all tension as the deep front-thigh muscle releases.'
        ],
        illustrationType: 'kneeling-quad-left'
      },
      {
        id: 'fs-7',
        name: 'Pigeon Pose (Left Side Deep Hip Opener)',
        target: 'Glutes, piriformis, and deep lateral rotation of the left leg.',
        duration: 60,
        tips: 'Your left shin does not have to be parallel to the front of the mat. Aim for a comfortable angle. Keep your waist squared to the front, avoiding collapsing onto your left cheek.',
        instructions: [
          'From all fours, slide your left knee forward towards your left wrist.',
          'Bring your left foot over towards the right wrist, angling your shin.',
          'Slide your right leg straight back behind you, pointing your toes.',
          'Slowly lower down to your forearms or rest your forehead on crossed hands.'
        ],
        illustrationType: 'pigeon'
      },
      {
        id: 'fs-8',
        name: 'Pigeon Pose (Right Side Deep Hip Opener)',
        target: 'Glutes, hip rotators on the right leg, creating symmetric extension.',
        duration: 60,
        tips: 'Spend the first few breaths upright to find balance, then lay your torso forward to access the deep, passive release.',
        instructions: [
          'Slide your right knee forward towards your right wrist.',
          'Angle your right shin and foot towards the left side of your mat.',
          'Extend your left leg fully behind you, pressing your left hip bone down.',
          'Rest forward onto your forearms, focusing on deep exhales.'
        ],
        illustrationType: 'pigeon'
      },
      {
        id: 'fs-9',
        name: 'Left Side Splits Hold',
        target: 'Active splits extension on the left side (left foot forward).',
        duration: 60,
        tips: 'NEVER force a full split. Use pillows, blocks, or your hands on the ground to support your weight. Slowly slide your heel out while keeping hips square. Only slide until you feel an 8/10 intensity, never pain.',
        instructions: [
          'Place blocks or stack thick books on both sides of your hips.',
          'Step your left foot forward and right knee backward.',
          'Supporting your entire body weight with your hands on your blocks, slowly slide your left heel forward.',
          'Maintain square hips (facing forward) and breathe softly for the final hold of the left side.'
        ],
        illustrationType: 'left-split'
      },
      {
        id: 'fs-10',
        name: 'Right Side Splits Hold',
        target: 'Active splits extension on the right side (right foot forward).',
        duration: 60,
        tips: 'Be mindful if one side feels significantly tighter than the other—it is completely normal! Back off slightly on your tighter side to avoid strain and focus on deep breathing.',
        instructions: [
          'Keep your blocks ready on both sides of your hips.',
          'Step your right foot forward and left knee backward.',
          'Supporting your entire body weight with your hands on your blocks, slowly slide your right heel forward.',
          'Keep your hips square to the front and ease into the right-side splits hold gently.'
        ],
         illustrationType: 'right-split'
      }
    ]
  },
  {
    id: 'middle-split-prep',
    name: 'Middle Splits Prep',
    description: 'An inner thigh and hip stretch to help improve side flexibility.',
    durationMinutes: 8,
    level: 'Beginner',
    focus: 'Middle Split',
    bananaMultiplier: 1.8,
    stretches: [
      {
        id: 'ms-1',
        name: 'Butterfly Stretch',
        target: 'Inner thighs (adductors) and groin opening.',
        duration: 60,
        tips: 'Keep your spine straight and tall. Gently press your knees down using your muscular strength, or light pressure from your elbows. Avoid rapid bouncing.',
        instructions: [
          'Sit tall on the floor, bend your knees, and press the soles of your feet together.',
          'Slide your heels as close to your groin as is comfortable.',
          'Holding your ankles, pull your shoulders back and lengthen your spine.',
          'Inhale to create length; exhale as you hinge forward from the hips with a flat back.'
        ],
        illustrationType: 'butterfly'
      },
      {
        id: 'ms-2',
        name: 'Wide-Angle seated Straddle fold',
        target: 'Deep groin, adductor magnus, and inner hamstrings.',
        duration: 60,
        tips: 'Keep your toes and knees pointing upwards to the sky. If your spine rounds backwards, sit up on a folded blanket or block to tilt your pelvis forward.',
        instructions: [
          'Sit on the floor and spread your legs into a wide "V" shape.',
          'Flex your feet and make sure your toes point directly towards the ceiling.',
          'Walk your hands out in front of you along the floor.',
          'Keep your shoulders relaxed and slowly hinge forward, sinking closer on the exhales.'
        ],
        illustrationType: 'straddle'
      },
      {
        id: 'ms-3',
        name: 'Frog Stretch (Adductor Special)',
        target: 'A helpful side-splits stretch to loosen your hip joints and groin.',
        duration: 90,
        tips: 'Keep your hips aligned directly between your knees, not pushed forward or backward. Your lower legs should be parallel, with feet flexed.',
        instructions: [
          'Start on your hands and knees. Gently slide your knees as far outward as comfortable.',
          'Keep your knees bent at 90-degree angles, with inner shins flat on the floor.',
          'Flex your ankles so your toes point outward to the sides.',
          'Carefully lower your torso onto your forearms, and soften your hips down towards the ground.'
        ],
        illustrationType: 'frog'
      },
      {
        id: 'ms-4',
        name: 'Deep Lizard Lunge (Left Side)',
        target: 'Inner thighs, groin, outer hips, and hip flexors.',
        duration: 60,
        tips: 'Let your left knee flare out to the left slightly if you want a deeper outer-hip opener. Otherwise, keep it close to your left shoulder.',
        instructions: [
          'Step your left foot forward past the outside of your left hand.',
          'Lower your right knee and shin to the mat, letting your hips sink fully forward.',
          'Bring both elbows or forearms down onto the mat (or onto a yoga block).',
          'Keep your chest reaching forward and breathe as you stretch your hips.'
        ],
        illustrationType: 'lizard'
      },
      {
        id: 'ms-5',
        name: 'Deep Lizard Lunge (Right Side)',
        target: 'Inner thighs, groin, and left hip flexor openers.',
        duration: 60,
        tips: 'Release tension in your jaw and neck while holding. Deep, slow breathing helps you relax into the stretch.',
        instructions: [
          'Step your right foot far forward, outside of your right palm.',
          'Lower your left knee to the floor, releasing the leg behind you.',
          'Walk your hands or forearms down inside your right foot.',
          'Soften into the stretch for a full minute, holding steady.'
        ],
        illustrationType: 'lizard'
      },
      {
        id: 'ms-6',
        name: 'Active Middle Splits Hold',
        target: 'Side-split stance rehearsal and active adductor strength.',
        duration: 90,
        tips: 'Keep your core engaged. Supporting yourself on your elbows, slide your knees (with pad protection) or feet wide. Go slowly, and concentrate on letting your weight settle onto your arms.',
        instructions: [
          'Stand in a wide stance, or drop from a wide squat, putting your forearms or hands on the floor.',
          'Slowly allow your feet to slide wider apart along a smooth surface (or on yoga blocks/socks).',
          'Ensure your knees and toes are pointing straight forward or slightly upward.',
          'Lower yourself to a safe depth and hold, letting gravity gradually pull you closer to the floor.'
        ],
        illustrationType: 'middle-split'
      }
    ]
  },
  {
    id: 'banana-maintenance',
    name: 'Daily Hip Maintenance',
    description: 'A quick 5-minute desk-break routine to loosen tight joints and build daily pelvic flexibility.',
    durationMinutes: 5,
    level: 'Beginner',
    focus: 'Hips & Hamstrings',
    bananaMultiplier: 1.0,
    stretches: [
      {
        id: 'm-1',
        name: 'Standing Forward Fold',
        target: 'Posterior chain decompression: entire hamstrings, back, and calves.',
        duration: 60,
        tips: 'Keep your knees bent slightly if your lower back is tight. Let gravity do all the work, relaxing your neck completely and shaking your head "yes" and "no".',
        instructions: [
          'Stand with feet hip-width apart and take a deep breath in.',
          'Exhale and hinge forward at your waist, folding your torso over your legs.',
          'Let your head and arms hang heavy towards the floor.',
          'Hold opposite elbows with compile hands to create a gentle weight, swaying slightly.'
        ],
        illustrationType: 'hamstring-fold'
      },
      {
        id: 'm-2',
        name: 'Wide Yogi Squat (Malasana)',
        target: 'Pelvic floor relaxation, deep adductor and hip opening.',
        duration: 60,
        tips: 'Press your elbows against your knees to flare them wide, and lift your breastbone high to lengthen your lower lumbar area.',
        instructions: [
          'Stand with feet slightly wider than shoulder-width, toes turned out 45 degrees.',
          'Sink your hips deep into a low squat, keeping your heels flat on the floor if possible.',
          'Bring your palms to touch in prayer position in front of your chest.',
          'Keep your shoulders down, and sit upright, pressing elbows outwards.'
        ],
        illustrationType: 'yogi-squat'
      },
      {
        id: 'm-3',
        name: 'Kneeling low-lunge to half-split transition',
        target: 'Hamstring & hip-flexor dynamic toggle.',
        duration: 90,
        tips: 'Move smoothly with your breath. Inhale forward into the lunge, exhale backward into the half-split folding stretch.',
        instructions: [
          'Place your left knee on the floor and step your right foot forward into a lunge.',
          'Inhale: press hips forward, feeling the left hip-flexor stretch.',
          'Exhale: shift your weight backward, straight-out your right leg, flex the toes, and bow over your right thigh.',
          'Repeat this wave-like transition continuously for 45 seconds, then switch legs and repeat.'
        ],
        illustrationType: 'half-split'
      },
      {
        id: 'm-4',
        name: 'Active Butterfly Pulsing',
        target: 'Inner thigh mobility and adductor stretching.',
        duration: 60,
        tips: 'Avoid aggressive bouncing. Think of gentle, butterfly wing flaps, followed by a stationary deep fold for the final 20 seconds.',
        instructions: [
          'Sit with soles of feet connected and knees relaxed outward.',
          'Perform tiny, rhythmic, active pulses up and down to expand the inner-groin range of motion.',
          'Walk your hands forward, curl your spine gently, and let your head drop towards your toes for a static hold.'
        ],
        illustrationType: 'butterfly'
      }
    ]
  }
];
