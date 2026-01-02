import { Body, Controller, Post } from "@nestjs/common";

@Controller()
export class DoubleController {
  @Post("double")
  double(@Body() body: { value: number }) {
    return { result: Number(body.value) * 2 };
  }
}
