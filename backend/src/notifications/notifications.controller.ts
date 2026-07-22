import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from "@nestjs/swagger";

class PushSubscriptionDto {
  @ApiProperty({
    description: "Push subscription endpoint URL",
    example: "https://fcm.googleapis.com/fcm/send/...",
  })
  endpoint: string;

  @ApiProperty({
    description: "Push subscription encryption keys",
    properties: {
      p256dh: { type: "string", description: "P256DH key" },
      auth: { type: "string", description: "Auth secret" },
    },
  })
  keys: { p256dh: string; auth: string };
}

class SendNotificationDto {
  @ApiProperty({ description: "Target user ID" })
  userId: string;

  @ApiProperty({
    description: "Notification title",
    example: "New achievement unlocked!",
  })
  title: string;

  @ApiProperty({
    description: "Notification body text",
    example: "You earned the Streak Master badge.",
  })
  body: string;

  @ApiProperty({
    description: "Optional notification tag for deduplication",
    required: false,
  })
  tag?: string;
}

class BroadcastDto {
  @ApiProperty({
    description: "Notification title",
    example: "System maintenance",
  })
  title: string;

  @ApiProperty({
    description: "Notification body text",
    example: "Scheduled downtime tonight.",
  })
  body: string;

  @ApiProperty({ description: "Optional notification tag", required: false })
  tag?: string;
}

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("vapid-public-key")
  @ApiOperation({ summary: "Get VAPID public key for push notifications" })
  @ApiResponse({ status: 200, description: "Return the VAPID public key." })
  getVapidPublicKey() {
    const publicKey = this.notificationsService.getVapidPublicKey();
    return { publicKey };
  }

  @Post("subscribe")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Subscribe to push notifications" })
  @ApiResponse({ status: 200, description: "Subscription registered." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async subscribe(@Req() req: any, @Body() body: PushSubscriptionDto) {
    const userId = req.user.id;
    await this.notificationsService.subscribe(userId, body);
    return { success: true };
  }

  @Delete("unsubscribe")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Unsubscribe from push notifications" })
  @ApiResponse({ status: 200, description: "Subscription removed." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async unsubscribe(@Req() req: any, @Body() body: { endpoint: string }) {
    const userId = req.user.id;
    await this.notificationsService.unsubscribe(userId, body.endpoint);
    return { success: true };
  }

  @Get("subscriptions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get active push subscriptions count" })
  @ApiResponse({ status: 200, description: "Return subscription count." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async getSubscriptions(@Req() req: any) {
    const userId = req.user.id;
    const subs = await this.notificationsService.getSubscriptions(userId);
    return { count: subs.length };
  }

  @Post("send")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Send notification to a specific user (self or admin)",
  })
  @ApiResponse({
    status: 200,
    description: "Notification sent or access denied.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  async sendNotification(@Req() req: any, @Body() body: SendNotificationDto) {
    if (req.user.id !== body.userId && req.user.role !== "ADMIN") {
      throw new ForbiddenException(
        "Can only send notifications to yourself unless admin",
      );
    }
    await this.notificationsService.sendToUser(body.userId, {
      title: body.title,
      body: body.body,
      tag: body.tag,
    });
    return { success: true };
  }

  @Post("broadcast")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Broadcast notification to all users (admin only)" })
  @ApiResponse({ status: 200, description: "Broadcast sent or access denied." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 403, description: "Admin role required." })
  async broadcast(@Body() body: BroadcastDto) {
    await this.notificationsService.sendToAll({
      title: body.title,
      body: body.body,
      tag: body.tag,
    });
    return { success: true };
  }
}
