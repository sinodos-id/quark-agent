import { WACIMessage } from '@extrimian/waci';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WACIMessageThread } from '../schemas/waci-message.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WACIMessageMongoRepository {
  constructor(
    @InjectModel(WACIMessageThread.name)
    private waciMessageModel: Model<WACIMessageThread>,
  ) {}

  async add(threadId: string, messages: WACIMessage[]): Promise<void> {
    await new this.waciMessageModel({
      threadId,
      messages,
    }).save();
  }

  async get(threadId: string): Promise<WACIMessage[]> {
    return this.waciMessageModel.findOne({ threadId: threadId });
  }

  getAll(): Promise<WACIMessageThread[]> {
    return this.waciMessageModel.find();
  }

  async remove(threadId: string): Promise<void> {
    await this.waciMessageModel.deleteOne({ threadId });
  }

  async update(threadId: string, messages: WACIMessage[]): Promise<void> {
    const thread = await this.waciMessageModel.findOne({ threadId });
    if (!thread) throw new Error('Thread not found');

    this.waciMessageModel.updateOne(
      { threadId },
      { messages: [...thread.messages, ...messages] },
    );
  }
}
