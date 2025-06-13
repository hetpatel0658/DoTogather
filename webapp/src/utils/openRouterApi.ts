
interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const suggestTask = async (): Promise<string> => {
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
            "role": "user",
            "content": "Suggest a simple daily task for habit-building. Just provide the task name only, no explanation or introduction needed."
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    // Extract the suggestion from the response
    const suggestion = data.choices[0]?.message?.content?.trim();
    
    if (!suggestion) {
      throw new Error("No suggestion received from API");
    }
    
    return suggestion;
  } catch (error) {
    console.error("Error suggesting task:", error);
    throw error;
  }
};
