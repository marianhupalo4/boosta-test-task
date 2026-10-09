import type { Outcome } from '@adhd/shared';

export type Gender = 'male' | 'female';

interface GenderedContent {
  explanation: string;
  strengths: { intro?: string; items: string[] };
  emotional: { intro: string; items: string[]; outro?: string };
}

interface OutcomeContent {
  label: string;
  faq: { question: string; answer: string }[];
  byGender: Record<Gender, GenderedContent>;
}

const HIGH_STRENGTHS_INTRO =
  'Despite these challenges, you possess real strengths:';

export const content: Record<Outcome, OutcomeContent> = {
  low: {
    label: 'Low ADHD Traits',
    byGender: {
      male: {
        explanation:
          'Your score suggests minimal ADHD traits. You show a strong ability to focus, stay organized, and manage daily responsibilities. In men, ADHD traits may more often appear through difficulties with attention, impulsivity, or restlessness. Your results suggest these challenges are unlikely to significantly affect your daily functioning.',
        strengths: {
          items: [
            'Strong ability to sustain attention and complete tasks',
            'Good impulse control and measured decision-making',
            'Consistent and reliable in personal and professional responsibilities',
            'Effective time management and organizational skills',
          ],
        },
        emotional: {
          intro:
            'Your low ADHD trait score suggests strong emotional regulation and impulse control in most situations. Men may sometimes experience ADHD-related challenges through impulsivity, restlessness, or difficulty managing frustration. Your results indicate that you generally maintain control and manage unexpected situations effectively.',
          items: [],
        },
      },
      female: {
        explanation:
          'Your score suggests minimal ADHD traits. You show a strong ability to focus, stay organized, and manage daily responsibilities. For women, ADHD traits can sometimes appear more subtly through difficulties with attention, mental organization, or managing multiple demands. Your results suggest these challenges are unlikely to significantly affect your daily functioning.',
        strengths: {
          items: [
            'Strong ability to sustain attention and complete tasks',
            'Effective organization and management of daily responsibilities',
            'Consistent and reliable in personal and professional settings',
            'Good self-regulation and thoughtful decision-making',
          ],
        },
        emotional: {
          intro:
            'Your low ADHD trait score suggests strong emotional regulation in most situations. Women may sometimes experience ADHD-related challenges through emotional overwhelm or difficulty managing competing demands. Your results indicate that you generally handle stress, frustration, and unexpected changes effectively.',
          items: [],
        },
      },
    },
    faq: [
      {
        question: "Does a low ADHD score mean I definitely don't have ADHD?",
        answer:
          'A low score suggests minimal ADHD traits, but if you have concerns, a professional evaluation can provide a definitive answer.',
      },
      {
        question:
          'Can I still benefit from brain training with low ADHD traits?',
        answer:
          'Yes. Regular cognitive training helps keep attention, memory, and problem-solving sharp regardless of your ADHD trait level.',
      },
      {
        question: 'What can I do to maintain my strong cognitive performance?',
        answer:
          'Consistent sleep, physical activity, focused work blocks, and regularly learning new skills all help maintain strong cognitive performance.',
      },
      {
        question: 'Can my ADHD trait levels change over time?',
        answer:
          'Yes. Stress, sleep, life circumstances, and habits can influence how strongly ADHD traits show up. Retaking the test later helps you track changes.',
      },
      {
        question: 'Is a low score something to be proud of?',
        answer:
          'A low score reflects your current focus and self-regulation habits. It is not a measure of worth, but it does suggest your routines are working well for you.',
      },
    ],
  },
  high: {
    label: 'High ADHD Traits',
    byGender: {
      male: {
        explanation:
          'Your score suggests that you exhibit high ADHD traits, meaning that difficulties with attention, impulse control, restlessness, and executive functioning may significantly affect daily life. In men, ADHD traits may be more noticeable through difficulties with impulsivity, maintaining focus, managing restlessness, or staying consistent with everyday tasks. At the same time, many men develop effective coping strategies that help them manage these challenges while drawing on their energy, creativity, and adaptability.',
        strengths: {
          intro: HIGH_STRENGTHS_INTRO,
          items: [
            'Strong creative problem-solving and ability to adapt quickly',
            'Ability to think outside the box and find unconventional solutions',
            'High energy and enthusiasm when engaged in areas of interest',
            'Resilience and persistence when facing setbacks',
            'Ability to hyperfocus on activities that capture your interest',
          ],
        },
        emotional: {
          intro:
            'Your high ADHD traits may influence your emotional responses and impulse control. Men with ADHD may sometimes experience greater difficulty with impulsivity, restlessness, or managing frustration. You may:',
          items: [
            'React quickly or impulsively when emotions run high',
            'Struggle with frustration and impatience in stressful situations',
            'Feel restless or find it difficult to stay engaged with tasks that feel repetitive',
            'Find it challenging to pause before interrupting conversations or making decisions',
          ],
          outro:
            'While impulse control can be challenging, developing self-awareness, structured routines, and practical coping strategies can help improve emotional regulation and everyday decision-making.',
        },
      },
      female: {
        explanation:
          'Your score suggests that you exhibit high ADHD traits, meaning that difficulties with attention, organization, emotional regulation, and managing competing demands may significantly affect daily life. In women, ADHD can sometimes be less outwardly noticeable and may involve difficulties with staying organized, managing mental load, maintaining focus, or keeping up with multiple responsibilities. At the same time, many women develop strong coping strategies that help them compensate for these challenges while drawing on their creativity, adaptability, and resilience.',
        strengths: {
          intro: HIGH_STRENGTHS_INTRO,
          items: [
            'Strong creative problem-solving and ability to adapt to changing situations',
            'Ability to see connections and possibilities others may overlook',
            'High enthusiasm and energy when engaged in meaningful activities',
            'Resilience and determination when facing setbacks',
            'Ability to hyperfocus on areas of strong interest when properly channeled',
          ],
        },
        emotional: {
          intro:
            'Your high ADHD traits may influence how you experience and manage emotions. Women with ADHD may sometimes experience stronger emotional responses, mental overwhelm, or difficulty balancing multiple demands. You may:',
          items: [
            'Experience intense emotions or become emotionally overwhelmed more easily',
            'Struggle with frustration when responsibilities or plans become difficult to manage',
            'Feel particularly affected by unexpected changes or setbacks',
            'Find it challenging to shift attention away from thoughts, tasks, or situations that feel emotionally significant',
          ],
          outro:
            'While emotional regulation can be challenging, developing self-awareness, supportive routines, and practical coping strategies can help create greater emotional stability.',
        },
      },
    },
    faq: [
      {
        question: 'Does a high ADHD score mean I have ADHD?',
        answer:
          'This score suggests significant ADHD traits, but an official diagnosis requires professional evaluation.',
      },
      {
        question: 'Can ADHD traits be strengths?',
        answer:
          'Yes. Creativity, energy, adaptability, and the ability to hyperfocus are common strengths among people with high ADHD traits.',
      },
      {
        question: 'What strategies can help manage high ADHD traits?',
        answer:
          'Breaking tasks into small steps, using reminders and timers, keeping consistent routines, and getting enough sleep and exercise can all help.',
      },
      {
        question: 'Does this score mean I struggle with emotional regulation?',
        answer:
          'Not necessarily. High ADHD traits are often linked with stronger emotional responses, but everyone experiences this differently.',
      },
      {
        question: 'How can I stay organized with high ADHD traits?',
        answer:
          'External systems work best: calendars, checklists, a fixed place for important items, and short daily planning sessions.',
      },
      {
        question: 'Can my ADHD trait levels change over time?',
        answer:
          'Yes. Stress, sleep, life circumstances, and new habits can influence how strongly ADHD traits show up. Retaking the test later helps you track changes.',
      },
    ],
  },
};
