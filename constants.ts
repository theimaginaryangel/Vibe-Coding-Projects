
export const TONE_OPTIONS = [
  "Professional",
  "Casual",
  "Enthusiastic",
  "Formal",
  "Humorous",
  "Sarcastic",
  "Empathetic",
  "Direct",
];

export const FORMAT_OPTIONS = [
  "Paragraph",
  "Bulleted List",
  "Numbered List",
  "JSON Object",
  "Markdown Table",
  "Step-by-step instructions",
  "Email",
  "Code Snippet",
];

export interface PromptTemplate {
  name: string;
  userInput: string;
  context: string;
  tone: string;
  format: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: "Blog Post Idea Generator",
    userInput: "Generate 5 creative and engaging blog post ideas about a specific topic.",
    context: "Topic: [Your Topic Here]\nTarget Audience: [e.g., beginner developers, marketing professionals]\nBlog's main focus: [e.g., tutorials, industry news]",
    tone: "Enthusiastic",
    format: "Bulleted List",
  },
  {
    name: "Social Media Post Creator",
    userInput: "Craft a short, engaging social media post for Twitter/X based on the provided details.",
    context: "Key message: [e.g., Announcing a new feature, sharing a link to an article]\nCall to action: [e.g., 'Check it out!', 'What do you think?']\nInclude relevant hashtags.",
    tone: "Casual",
    format: "Paragraph",
  },
  {
    name: "Technical Explanation Simplifier",
    userInput: "Explain a complex technical topic in simple terms that a non-expert can understand. Use an analogy.",
    context: "Complex Topic: [e.g., 'How blockchain works', 'The concept of recursion']\nThe audience has no prior knowledge of this field.",
    tone: "Empathetic",
    format: "Step-by-step instructions",
  },
  {
    name: "Email Subject Line Crafter",
    userInput: "Generate 5 compelling and clickable email subject lines for a marketing email.",
    context: "Email Content Summary: [e.g., 'Announcing a 20% off sale on all products']\nTarget Audience: [e.g., 'Previous customers']\nGoal: Maximize open rates.",
    tone: "Professional",
    format: "Numbered List",
  },
  {
    name: "Code Comment Generator",
    userInput: "Write a clear, professional code comment for the provided code snippet, explaining its purpose, parameters, and return value.",
    context: "Programming Language: [e.g., JavaScript, Python]\n\nCode Snippet:\n[PASTE YOUR CODE HERE]",
    tone: "Direct",
    format: "Paragraph",
  },
];
