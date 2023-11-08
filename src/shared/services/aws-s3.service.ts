import { S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

import { AWS_DOMAIN, AWS_S3, DOT, HTTPS, SLASH } from '../../constants';
import type { IFile } from '../../interfaces';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const awsS3Config = configService.awsS3Config;

    this.s3 = new S3({
      region: awsS3Config.bucketRegion,
      credentials: {
        accessKeyId: awsS3Config.accessKey,
        secretAccessKey: awsS3Config.secretKey,
      },
    });
  }

  async uploadFile(file: IFile, path: string, userId: number): Promise<string> {
    const key = path + SLASH + userId + SLASH + file.originalname;
    await this.s3.putObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Body: file.buffer,
      Key: key,
    });

    const bucketRegionUrl = [
      this.configService.awsS3Config.bucketName,
      AWS_S3,
      this.configService.awsS3Config.bucketRegion,
      AWS_DOMAIN,
    ].join(DOT);

    return [HTTPS, bucketRegionUrl, SLASH, key].join('');
  }
}
