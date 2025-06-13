
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const evaluateTaskForBadge = async (taskName: string, userStats: {
  completedTasks: number;
  currentStreak: number;
  points: number;
}): Promise<{ shouldAwardBadge: boolean; badgeData?: { name: string; icon: string; description: string } }> => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "HTTP-Referer": "daily-micro-task-planner", 
        "X-Title": "Daily Micro-Task Planner", 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-r1:free",
        "messages": [
          {
            "role": "system",
            "content": "You are a badge evaluation system. Analyze if a task completion deserves a special achievement badge based on difficulty, uniqueness, or achievement level. Respond with JSON only."
          },
          {
            "role": "user",
            "content": `Evaluate if this task deserves a special badge: "${taskName}". User stats: ${userStats.completedTasks} completed tasks, ${userStats.currentStreak} day streak, ${userStats.points} points. 

If it deserves a badge, respond with:
{"shouldAwardBadge": true, "badgeData": {"name": "Badge Name", "icon": "🏆", "description": "Achievement description"}}

If not, respond with:
{"shouldAwardBadge": false}

Consider awarding badges for: challenging physical tasks (like walking 10km), exceptional streaks, difficult habits, creative tasks, or significant milestones.`
          }
        ],
        "temperature": 0.3,
        "max_tokens": 200
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error("No response received from API");
    }
    
    // Parse the JSON response
    const result = JSON.parse(content);
    return result;
    
  } catch (error) {
    console.error("Error evaluating task for badge:", error);
    // Return false if there's any error to avoid breaking the flow
    return { shouldAwardBadge: false };
  }
};
