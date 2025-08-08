import connectDB from "@/lib/db"
import MissionProgress from "@/models/MissionProgress"
import Mission from "@/models/Mission"
import User from "@/models/User"
import { awardXP } from "./awardXP"

export class MissionTracker {
  static async updateProgress(
    userId: string,
    metric: string,
    increment: number = 1,
    metadata?: any
  ) {
    try {
      await connectDB()

      // Find active missions for this user that track this metric
      const activeMissions = await MissionProgress.find({
        user: userId,
        status: "active"
      }).populate("mission")

      for (const missionProgress of activeMissions) {
        const mission = missionProgress.mission as any
        let updated = false

        // Update progress for relevant steps
        for (let i = 0; i < missionProgress.progress.length; i++) {
          const stepProgress = missionProgress.progress[i]
          const missionStep = mission.steps.find((s: any) => s.id === stepProgress.stepId)

          if (missionStep && missionStep.metric === metric && !stepProgress.completed) {
            stepProgress.current = Math.min(stepProgress.current + increment, stepProgress.target)
            
            if (stepProgress.current >= stepProgress.target) {
              stepProgress.completed = true
              missionProgress.stepsCompleted.push(stepProgress.stepId)
              updated = true
            }
          }
        }

        // Check if mission is completed
        const allStepsCompleted = missionProgress.progress.every((p: any) => p.completed)
        if (allStepsCompleted && missionProgress.status === "active") {
          missionProgress.status = "completed"
          missionProgress.completedAt = new Date()
          missionProgress.xpEarned = mission.rewards.xp

          // Award mission completion XP and badges
          await awardXP(userId, "mission_completed", mission._id.toString())
          
          if (mission.rewards.badge) {
            await User.findByIdAndUpdate(userId, {
              $addToSet: { badges: mission.rewards.badge }
            })
          }

          // Update mission completion count
          await Mission.findByIdAndUpdate(mission._id, {
            $inc: { completionCount: 1 }
          })

          updated = true
        }

        if (updated) {
          await missionProgress.save()
        }
      }
    } catch (error) {
      console.error("Mission progress update error:", error)
    }
  }

  static async getUserMissions(userId: string) {
    try {
      await connectDB()

      const userMissions = await MissionProgress.find({ user: userId })
        .populate("mission")
        .sort({ createdAt: -1 })

      return userMissions
    } catch (error) {
      console.error("Get user missions error:", error)
      return []
    }
  }

  static async getAvailableMissions(userId: string) {
    try {
      await connectDB()

      // Get missions user hasn't joined yet
      const userMissionIds = await MissionProgress.find({ user: userId })
        .distinct("mission")

      const availableMissions = await Mission.find({
        _id: { $nin: userMissionIds },
        isActive: true
      }).populate("createdBy", "username avatar")

      return availableMissions
    } catch (error) {
      console.error("Get available missions error:", error)
      return []
    }
  }
}