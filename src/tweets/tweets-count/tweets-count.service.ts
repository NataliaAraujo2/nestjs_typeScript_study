import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Tweet } from '../entities/tweet.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';

@Injectable()
export class TweetsCountService {
  private limit = 10;
  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Interval(5000)
  async countTweets() {
    let offset = await this.cacheManager.get<number>('tweet-offset');
    offset = offset === undefined ? 0 : offset;
    const tweets = await this.tweetModel.findAll({
      offset: 0,
      limit: this.limit,
    });

    if (tweets.length === this.limit) {
      this.cacheManager.set('tweet-offset', offset + this.limit);
      console.log(`achou + ${this.limit} tweets`);
    }
  }
}
