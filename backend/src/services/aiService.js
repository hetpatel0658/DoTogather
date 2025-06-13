import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Generate task suggestions based on user input
export const generateTaskSuggestions = async (prompt, category, count = 5) => {
  if (!openai) {
    // Fallback suggestions when OpenAI is not configured
    return getFallbackTaskSuggestions(prompt, category, count);
  }

  try {
    const systemPrompt = `You are a productivity assistant that helps users break down goals into actionable tasks. 
    Generate ${count} specific, actionable tasks based on the user's input. 
    ${category ? `Focus on the ${category} category.` : ''}
    
    For each task, provide:
    - name: A clear, actionable task name (max 50 characters)
    - description: Brief description (max 100 characters)
    - estimatedDuration: Time in minutes (15-120)
    - priority: low, medium, or high
    - difficulty: 1-5 scale
    - points: 10-50 based on difficulty and time
    
    Return as JSON array.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, count) : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return getFallbackTaskSuggestions(prompt, category, count);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackTaskSuggestions(prompt, category, count);
  }
};

// Analyze task description and provide insights
export const analyzeTaskDescription = async (description, category) => {
  if (!openai) {
    return getFallbackTaskAnalysis(description, category);
  }

  try {
    const systemPrompt = `Analyze the given task description and provide insights:
    - estimatedDuration: Time in minutes
    - suggestedPriority: low, medium, or high
    - suggestedCategory: work, personal, health, learning, social, or other
    - difficulty: 1-5 scale
    - tips: Array of 2-3 helpful tips for completing this task
    - breakdown: Array of 2-4 subtasks if the task is complex
    
    Return as JSON object.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Task: ${description}${category ? ` (Category: ${category})` : ''}` }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return getFallbackTaskAnalysis(description, category);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackTaskAnalysis(description, category);
  }
};

// Generate personalized productivity tips
export const generateProductivityTips = async (user, focusArea) => {
  if (!openai) {
    return getFallbackProductivityTips(focusArea);
  }

  try {
    const userContext = `User has ${user.points} points, level ${user.level}, current streak: ${user.currentStreak} days.`;
    const systemPrompt = `Generate 3-5 personalized productivity tips for this user.
    ${focusArea ? `Focus on: ${focusArea}` : ''}
    
    Consider their current level and streak. Make tips actionable and encouraging.
    Return as JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    
    try {
      const tips = JSON.parse(response);
      return Array.isArray(tips) ? tips : getFallbackProductivityTips(focusArea);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return getFallbackProductivityTips(focusArea);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackProductivityTips(focusArea);
  }
};

// Fallback functions when AI is not available

const getFallbackTaskSuggestions = (prompt, category, count) => {
  const suggestions = [
    {
      name: "Break down the main goal",
      description: "Identify the key components of your objective",
      estimatedDuration: 15,
      priority: "high",
      difficulty: 2,
      points: 15
    },
    {
      name: "Research best practices",
      description: "Look up proven methods and strategies",
      estimatedDuration: 30,
      priority: "medium",
      difficulty: 2,
      points: 20
    },
    {
      name: "Create action plan",
      description: "Outline specific steps to achieve your goal",
      estimatedDuration: 25,
      priority: "high",
      difficulty: 3,
      points: 25
    },
    {
      name: "Set up workspace",
      description: "Organize tools and environment for productivity",
      estimatedDuration: 20,
      priority: "medium",
      difficulty: 1,
      points: 15
    },
    {
      name: "Start with smallest step",
      description: "Begin with the easiest actionable task",
      estimatedDuration: 15,
      priority: "high",
      difficulty: 1,
      points: 10
    }
  ];

  return suggestions.slice(0, count);
};

const getFallbackTaskAnalysis = (description, category) => {
  const words = description.toLowerCase();
  let estimatedDuration = 30;
  let difficulty = 2;
  let priority = "medium";

  // Simple keyword-based analysis
  if (words.includes('research') || words.includes('study')) {
    estimatedDuration = 60;
    difficulty = 3;
  } else if (words.includes('quick') || words.includes('simple')) {
    estimatedDuration = 15;
    difficulty = 1;
  } else if (words.includes('complex') || words.includes('difficult')) {
    estimatedDuration = 90;
    difficulty = 4;
    priority = "high";
  }

  return {
    estimatedDuration,
    suggestedPriority: priority,
    suggestedCategory: category || "other",
    difficulty,
    tips: [
      "Break the task into smaller, manageable steps",
      "Set a specific time to work on this task",
      "Eliminate distractions before starting"
    ],
    breakdown: [
      "Prepare necessary materials and tools",
      "Complete the main work",
      "Review and finalize the task"
    ]
  };
};

const getFallbackProductivityTips = (focusArea) => {
  const generalTips = [
    "Use the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break",
    "Prioritize your most important tasks when your energy is highest",
    "Keep a clean and organized workspace to reduce distractions",
    "Set specific, measurable goals for each work session",
    "Celebrate small wins to maintain motivation"
  ];

  const focusSpecificTips = {
    time_management: [
      "Time-block your calendar to allocate specific periods for different activities",
      "Use the 2-minute rule: If something takes less than 2 minutes, do it now",
      "Batch similar tasks together to minimize context switching"
    ],
    focus: [
      "Turn off notifications during deep work sessions",
      "Use website blockers to avoid distracting sites",
      "Practice mindfulness meditation to improve concentration"
    ],
    motivation: [
      "Connect your tasks to your larger goals and values",
      "Find an accountability partner to check in with regularly",
      "Reward yourself after completing challenging tasks"
    ]
  };

  if (focusArea && focusSpecificTips[focusArea]) {
    return [...focusSpecificTips[focusArea], ...generalTips.slice(0, 2)];
  }

  return generalTips;
};