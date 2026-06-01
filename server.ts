import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/player", async (req, res) => {
    const query = req.query.name as string;
    if (!query) {
      return res.status(400).json({ error: "Missing player name query parameter." });
    }

    try {
      // Lazy initialization
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          team: { type: Type.STRING },
          sport: { type: Type.STRING, description: "E.g., NBA, NFL, MLB, NHL" },
          position: { type: Type.STRING },
          status: { type: Type.STRING, description: "General status or summary" },
          stats: {
            type: Type.OBJECT,
            properties: {
              stat1Label: { type: Type.STRING },
              stat1Value: { type: Type.STRING },
              stat2Label: { type: Type.STRING },
              stat2Value: { type: Type.STRING },
              stat3Label: { type: Type.STRING },
              stat3Value: { type: Type.STRING },
              stat4Label: { type: Type.STRING },
              stat4Value: { type: Type.STRING },
            },
            required: ["stat1Label", "stat1Value", "stat2Label", "stat2Value", "stat3Label", "stat3Value", "stat4Label", "stat4Value"]
          },
          recentGames: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                game: { type: Type.STRING, description: "E.g., VS LAL, @ GSW" },
                points: { type: Type.NUMBER, description: "Primary performance metric value (e.g., points, passing yards, hits)" },
                date: { type: Type.STRING }
              },
              required: ["game", "points", "date"]
            }
          },
          pastPlayoffs: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                   title: { type: Type.STRING, description: "E.g., 2023 NLCS GM 7" },
                   matchup: { type: Type.STRING, description: "E.g., ARI (4) @ PHI (2)" },
                   stats: { type: Type.STRING, description: "Player performance summary in that game" }
                },
                required: ["title", "matchup", "stats"]
             }
          },
          lastUpdated: { type: Type.STRING, description: "ISO 8601 date string representing the current sync time. Auto deletes/updates after 3 weeks." },
          highlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 notable career/recent highlights"
          }
        },
        required: ["id", "name", "team", "sport", "position", "status", "stats", "recentGames", "pastPlayoffs", "lastUpdated", "highlights"],
      };

      const prompt = `Provide the latest sporting data, detailed advanced statistics, recent game performances, and past playoff highlights for the athlete named "${query}".
      
Please populate the fields thoughtfully based on the actual player. For example:
- If NBA: include Points, Rebounds, Assists, True Shooting % in \`stats\`. \`recentGames.points\` should be their points scored.
- If NFL (QB): include Passing Yards, TDs, INTs, QBR in \`stats\`. \`recentGames.points\` should be passing yards.
- If MLB: include Batting Avg, HRs, RBIs, OPS in \`stats\`. \`recentGames.points\` should represent something else, or use a general rating if pitcher vs batter.
- For \`lastUpdated\`, provide today's date indicating the start of a 3-week caching period where older games or past playoff caches are cycled out.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      const playerData = JSON.parse(text);
      res.json(playerData);
      
    } catch (error: any) {
      console.error("Player Search Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch player data." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
