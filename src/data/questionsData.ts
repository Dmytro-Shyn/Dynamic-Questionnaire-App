import type { QuestionnaireConfig } from '@/types/questionnaire'

/**
 * Demo questionnaire: "Product Finder".
 *
 * The flow demonstrates every supported feature:
 *  - option-level branching (`category`),
 *  - numeric rules with gte / lt (`budget`),
 *  - array rule with contains (`features`),
 *  - plain fallback `next`,
 *  - all four question types (single, multiple, text, number).
 *
 * Node graph:
 *   category ─ smartphone ─┐
 *   category ─ laptop ──> laptop_use ─ gaming ─> laptop_gpu ─┐
 *   category ─ headphones -> headphones_type ────────────────┤
 *   category ─ other ────────────────────────────────────────┤
 *                                                            v
 *   budget (gte 1500 ─> brand_premium)  (lt 1500 ─> brand_midrange)
 *            │                                       │
 *            v                                       v
 *       brand_premium                          brand_midrange
 *            └───────────────> features ── contains gaming ─> gaming_detail
 *                                         │                      │
 *                                         └──> color <────────────┘
 *                                              │
 *                                              v
 *                                           contact ─> (done)
 */
export const questionnaireConfig = {
  id: 'product-finder',
  title: 'Product Finder',
  description:
    'Answer a few questions and we will recommend products that fit you.',
  firstQuestionId: 'category',
  questions: [
    {
      id: 'category',
      type: 'single',
      title: 'What are you looking for?',
      description: 'Choose the category you want us to recommend.',
      options: [
        { id: 'smartphone', label: 'Smartphone' },
        { id: 'laptop', label: 'Laptop', nextQuestionId: 'laptop_use' },
        {
          id: 'headphones',
          label: 'Headphones',
          nextQuestionId: 'headphones_type',
        },
        { id: 'other', label: 'Something else' },
      ],
      next: 'budget',
      validation: { required: true },
    },
    {
      id: 'laptop_use',
      type: 'single',
      title: 'How will you use the laptop?',
      options: [
        { id: 'work', label: 'Work / office' },
        { id: 'study', label: 'Study' },
        {
          id: 'gaming',
          label: 'Gaming',
          nextQuestionId: 'laptop_gpu',
        },
        { id: 'universal', label: 'Everything a bit' },
      ],
      next: 'budget',
      validation: { required: true },
    },
    {
      id: 'laptop_gpu',
      type: 'single',
      title: 'Do you need a dedicated graphics card?',
      options: [
        { id: 'dedicated', label: 'Yes, a dedicated GPU' },
        { id: 'integrated', label: 'Integrated is fine' },
      ],
      next: 'budget',
      validation: { required: true },
    },
    {
      id: 'headphones_type',
      type: 'single',
      title: 'Which headphone style do you prefer?',
      options: [
        { id: 'in_ear', label: 'In-ear (earbuds)' },
        { id: 'over_ear', label: 'Over-ear' },
        { id: 'wireless', label: 'True wireless' },
      ],
      next: 'budget',
      validation: { required: true },
    },
    {
      id: 'budget',
      type: 'number',
      title: 'What is your maximum budget?',
      description: 'Enter a number in USD. Premium products start at $1500.',
      validation: { required: true, min: 0, max: 100000 },
      rules: [
        {
          operator: 'gte',
          value: 1500,
          nextQuestionId: 'brand_premium',
        },
        {
          questionId: 'budget',
          operator: 'lt',
          value: 1500,
          nextQuestionId: 'brand_midrange',
        },
      ],
    },
    {
      id: 'brand_premium',
      type: 'single',
      title: 'Any preferred premium brand?',
      options: [
        { id: 'apple', label: 'Apple' },
        { id: 'samsung', label: 'Samsung' },
        { id: 'sony', label: 'Sony' },
        { id: 'asus', label: 'Asus' },
        { id: 'no_preference', label: 'No preference' },
      ],
      next: 'features',
      validation: { required: true },
    },
    {
      id: 'brand_midrange',
      type: 'single',
      title: 'Any preferred brand?',
      options: [
        { id: 'xiaomi', label: 'Xiaomi' },
        { id: 'lenovo', label: 'Lenovo' },
        { id: 'huawei', label: 'Huawei' },
        { id: 'anker', label: 'Anker' },
        { id: 'no_preference', label: 'No preference' },
      ],
      next: 'features',
      validation: { required: true },
    },
    {
      id: 'features',
      type: 'multiple',
      title: 'Which features matter to you?',
      description: 'Select all that apply.',
      options: [
        { id: 'battery', label: 'Long battery life' },
        { id: 'camera', label: 'Great camera' },
        { id: 'gaming', label: 'Gaming performance' },
        { id: 'portability', label: 'Lightweight / portable' },
        { id: 'audio', label: 'Excellent audio' },
      ],
      validation: { required: true },
      rules: [
        {
          operator: 'contains',
          value: 'gaming',
          nextQuestionId: 'gaming_detail',
        },
      ],
      next: 'color',
    },
    {
      id: 'gaming_detail',
      type: 'single',
      title: 'How serious is your gaming?',
      options: [
        { id: 'hardcore', label: 'Hardcore — max settings' },
        { id: 'casual', label: 'Casual — good frame rates' },
        { id: 'light', label: 'Light — occasional sessions' },
      ],
      next: 'color',
      validation: { required: true },
    },
    {
      id: 'color',
      type: 'single',
      title: 'Color preference?',
      options: [
        { id: 'dark', label: 'Dark / black' },
        { id: 'light', label: 'Light / white' },
        { id: 'colorful', label: 'Colorful' },
        { id: 'no_preference', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },
    {
      id: 'contact',
      type: 'text',
      title: 'Where should we send your results?',
      description: 'Leave your email to get the recommendations.',
      placeholder: 'you@example.com',
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      },
      next: null,
    },
  ],
} satisfies QuestionnaireConfig
