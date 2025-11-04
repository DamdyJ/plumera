import { Webhook } from "svix";
import { Request, Response } from "express";
import { user } from "src/db/schema";
import db from "src/db/db";
import { eq } from "drizzle-orm";
import { ClerkUserCreatedData, ClerkWebhookPayload } from "src/types/user.type";

export const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!CLERK_WEBHOOK_SIGNING_SECRET) {
      throw new Error(
        "Error: Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local",
      );
    }

    // Create new Svix instance with secret
    const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

    // Get the headers
    const svix_id = req.get("svix-id");
    const svix_timestamp = req.get("svix-timestamp");
    const svix_signature = req.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json("Error: Missing Svix headers");
    }

    try {
      await wh.verify(JSON.stringify(req.body), {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error verifying webhook:", error.message);
      }
      return res.status(400).send("Invalid webhook signature");
    }
    const { data, type } = req.body as ClerkWebhookPayload<ClerkUserCreatedData>;

    switch (type) {
      case "user.created": {
        const newUser = await db
          .insert(user)
          .values({
            id: data.id,
            username: data.username ?? null,
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            emailAddress:
              data.email_addresses?.[0]?.email_address ?? null,
            imageUrl: data.image_url ?? data.profile_image_url ?? null,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          })
          .returning();

        return res.status(200).json({
          success: true,
          data: newUser,
          traceId: res.locals.traceId,
        });
      }
      case "user.updated": {
        if (data.id != null) {
          const updatedUser = await db
            .update(user)
            .set({
              username: data.username ?? null,
              firstName: data.first_name ?? null,
              lastName: data.last_name ?? null,
              emailAddress:
                data.email_addresses?.[0]?.email_address ?? null,
              imageUrl: data.image_url ?? data.profile_image_url ?? null,
              updatedAt: new Date(data.updated_at),
            })
            .where(eq(user.id, data.id))
            .returning();

          return res.status(200).json({
            success: true,
            data: updatedUser,
            traceId: res.locals.traceId,
          });
        }

        return res.status(404).json({
          success: false,
          error: {
            message: "User not found or already deleted",
            status: 404,
          },
          traceId: res.locals.traceId,
        });
      }
      case "user.deleted": {
        if (data.id != null) {
          const deletedUser = await db.delete(user).where(eq(user.id, data.id)).returning()
          res.status(200).json({
            success: true,
            data: deletedUser,
            traceId: res.locals.traceId,
          });
        }
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found or already been deleted",
            status: 404,
          },
          traceId: res.locals.traceId,
        })
      }
    }
    return res.status(200).json("OK");
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,

        error: {
          message: error.message,
          status: 400,
        },
        traceId: res.locals.traceId,
      });
    }
    return res.status(500).json({
      success: false,

      error: {
        message: "Server error on clerk webhooks",
        status: 500,
      },
      traceId: res.locals.traceId,
    });
  }
};
