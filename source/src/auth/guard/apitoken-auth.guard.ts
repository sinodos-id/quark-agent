import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class ApiTokenAuthGuard extends AuthGuard('api-token'){};