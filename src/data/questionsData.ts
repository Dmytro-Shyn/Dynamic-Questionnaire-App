import type { QuestionnaireConfig } from '@/types/questionnaire'

/**
 * Demo questionnaire: "Product Finder".
 *
 * The flow demonstrates every supported feature, and each category follows its
 * own independent branch (separate budget, brand and feature questions):
 *
 *   - option-level redirect        (laptop_use → laptop_gpu)
 *   - numeric rules  gte / lt      (each category's `*_budget`)
 *   - array rule    contains       (phone_features → gaming_detail,
 *                                   headphone_features → anc_priority)
 *   - plain fallback `next`
 *   - all four question types (single, multiple, text, number)
 *
 * Branches:
 *   smartphone  ─ os ─> features ─contains gaming─> gaming_detail ─> budget ─> brand ─> contact
 *   laptop      ─ use ─contains gaming─> gpu ─> features ─> budget ─> brand ─> contact
 *   headphones  ─ type ─> features ─contains nc─> anc_priority ─> budget ─> brand ─> contact
 *   other       ─> budget ─> contact
 *
 * `contact` is a terminal question (`next: null`) shared by every branch only
 * because it captures delivery contact info and carries no category meaning.
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
        { id: 'smartphone', label: 'Smartphone', nextQuestionId: 'phone_os' },
        { id: 'laptop', label: 'Laptop', nextQuestionId: 'laptop_use' },
        {
          id: 'headphones',
          label: 'Headphones',
          nextQuestionId: 'headphones_type',
        },
        {
          id: 'other',
          label: 'Something else',
          nextQuestionId: 'other_budget',
        },
      ],
      next: null,
      validation: { required: true },
    },

    {
      id: 'other_budget',
      type: 'number',
      title: 'What is your approximate budget?',
      description: 'Enter a number in USD.',
      validation: { required: true, min: 0, max: 100000 },
      next: 'contact',
    },

    // ── smartphone ─────────────────────────────────────────────
    {
      id: 'phone_os',
      type: 'single',
      title: 'Which operating system do you prefer?',
      options: [
        { id: 'ios', label: 'iOS' },
        { id: 'android', label: 'Android' },
        { id: 'no_os', label: 'No preference' },
      ],
      next: 'phone_features',
      validation: { required: true },
    },
    {
      id: 'phone_features',
      type: 'multiple',
      title: 'Which phone features matter to you?',
      description: 'Select all that apply.',
      options: [
        { id: 'camera', label: 'Great camera' },
        { id: 'battery', label: 'Long battery life' },
        { id: 'screen', label: 'High refresh rate display' },
        { id: 'gaming', label: 'Gaming performance' },
        { id: 'connectivity', label: '5G / latest connectivity' },
      ],
      rules: [
        {
          operator: 'contains',
          value: 'gaming',
          nextQuestionId: 'gaming_detail',
        },
      ],
      next: 'phone_budget',
      validation: { required: true },
    },
    {
      id: 'gaming_detail',
      type: 'single',
      title: 'How serious is your mobile gaming?',
      options: [
        { id: 'competitive', label: 'Competitive — I need max performance' },
        { id: 'casual', label: 'Casual — good frame rates' },
        { id: 'light', label: 'Light — occasional sessions' },
      ],
      next: 'phone_budget',
      validation: { required: true },
    },
    {
      id: 'phone_budget',
      type: 'number',
      title: 'What is your maximum budget?',
      description: 'Premium phones start around $1000.',
      validation: { required: true, min: 0, max: 100000 },
      rules: [
        { operator: 'gte', value: 1000, nextQuestionId: 'phone_brand_premium' },
        {
          questionId: 'phone_budget',
          operator: 'lt',
          value: 1000,
          nextQuestionId: 'phone_brand_midrange',
        },
      ],
    },
    {
      id: 'phone_brand_premium',
      type: 'single',
      title: 'Which premium phone brand?',
      options: [
        { id: 'Apple', label: 'Apple' },
        { id: 'Samsung', label: 'Samsung' },
        { id: 'Sony', label: 'Sony' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },
    {
      id: 'phone_brand_midrange',
      type: 'single',
      title: 'Which brand?',
      options: [
        { id: 'Xiaomi', label: 'Xiaomi' },
        { id: 'OnePlus', label: 'OnePlus' },
        { id: 'Motorola', label: 'Motorola' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },

    // ── laptop ───────────────────────────────────────────────
    {
      id: 'laptop_use',
      type: 'single',
      title: 'How will you use the laptop?',
      options: [
        { id: 'work', label: 'Work / office' },
        { id: 'study', label: 'Study' },
        { id: 'gaming', label: 'Gaming', nextQuestionId: 'laptop_gpu' },
        { id: 'universal', label: 'Everything a bit' },
      ],
      next: 'laptop_features',
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
      next: 'laptop_features',
      validation: { required: true },
    },
    {
      id: 'laptop_features',
      type: 'multiple',
      title: 'Which laptop features matter to you?',
      description: 'Select all that apply.',
      options: [
        { id: 'gaming', label: 'Gaming performance' },
        { id: 'battery', label: 'Long battery life' },
        { id: 'portability', label: 'Lightweight / portable' },
        { id: 'display', label: 'High quality display' },
        { id: 'build', label: 'Premium build quality' },
      ],
      next: 'laptop_budget',
      validation: { required: true },
    },
    {
      id: 'laptop_budget',
      type: 'number',
      title: 'What is your maximum budget?',
      description: 'Premium laptops start around $1500.',
      validation: { required: true, min: 0, max: 100000 },
      rules: [
        {
          operator: 'gte',
          value: 1500,
          nextQuestionId: 'laptop_brand_premium',
        },
        {
          questionId: 'laptop_budget',
          operator: 'lt',
          value: 1500,
          nextQuestionId: 'laptop_brand_midrange',
        },
      ],
    },
    {
      id: 'laptop_brand_premium',
      type: 'single',
      title: 'Which premium laptop brand?',
      options: [
        { id: 'Apple', label: 'Apple' },
        { id: 'Lenovo', label: 'Lenovo' },
        { id: 'ASUS', label: 'Asus' },
        { id: 'Dell', label: 'Dell' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },
    {
      id: 'laptop_brand_midrange',
      type: 'single',
      title: 'Which brand?',
      options: [
        { id: 'Lenovo', label: 'Lenovo' },
        { id: 'ASUS', label: 'Asus' },
        { id: 'Acer', label: 'Acer' },
        { id: 'HP', label: 'HP' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },

    // ── headphones ───────────────────────────────────────────
    {
      id: 'headphones_type',
      type: 'single',
      title: 'Which headphone style do you prefer?',
      options: [
        { id: 'in_ear', label: 'In-ear (earbuds)' },
        { id: 'over_ear', label: 'Over-ear' },
        { id: 'wireless', label: 'True wireless' },
      ],
      next: 'headphone_features',
      validation: { required: true },
    },
    {
      id: 'headphone_features',
      type: 'multiple',
      title: 'Which headphone features matter to you?',
      description: 'Select all that apply.',
      options: [
        { id: 'noise_cancelling', label: 'Active noise cancellation' },
        { id: 'battery', label: 'Long battery life' },
        { id: 'comfort', label: 'Comfortable for long sessions' },
        { id: 'wireless', label: 'Reliable wireless' },
        { id: 'mic', label: 'Good microphone' },
      ],
      rules: [
        {
          operator: 'contains',
          value: 'noise_cancelling',
          nextQuestionId: 'anc_priority',
        },
      ],
      next: 'headphones_budget',
      validation: { required: true },
    },
    {
      id: 'anc_priority',
      type: 'single',
      title: 'How important is active noise cancellation?',
      options: [
        { id: 'must_have', label: 'Must have' },
        { id: 'nice_to_have', label: 'Nice to have' },
      ],
      next: 'headphones_budget',
      validation: { required: true },
    },
    {
      id: 'headphones_budget',
      type: 'number',
      title: 'What is your maximum budget?',
      description: 'Premium headphones start around $300.',
      validation: { required: true, min: 0, max: 100000 },
      rules: [
        {
          operator: 'gte',
          value: 300,
          nextQuestionId: 'headphones_brand_premium',
        },
        {
          questionId: 'headphones_budget',
          operator: 'lt',
          value: 300,
          nextQuestionId: 'headphones_brand_midrange',
        },
      ],
    },
    {
      id: 'headphones_brand_premium',
      type: 'single',
      title: 'Which premium headphone brand?',
      options: [
        { id: 'Sony', label: 'Sony' },
        { id: 'Bose', label: 'Bose' },
        { id: 'Sennheiser', label: 'Sennheiser' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },
    {
      id: 'headphones_brand_midrange',
      type: 'single',
      title: 'Which brand?',
      options: [
        { id: 'JBL', label: 'JBL' },
        { id: 'Anker', label: 'Anker' },
        { id: 'Sony', label: 'Sony' },
        { id: 'no_brand', label: 'No preference' },
      ],
      next: 'contact',
      validation: { required: true },
    },

    // ── shared terminal ──────────────────────────────────────
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
