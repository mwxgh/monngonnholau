import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'

@Injectable()
export class UploadService {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly publicUrl: string

  constructor(private readonly config: ConfigService) {
    const endpoint = config.getOrThrow<string>('AWS_S3_ENDPOINT')
    const port = config.get<string>('AWS_S3_PORT', '9000')
    const useSSL = config.get<string>('AWS_S3_USE_SSL', 'false') === 'true'
    const protocol = useSSL ? 'https' : 'http'

    this.bucket = config.getOrThrow<string>('AWS_S3_BUCKET')
    this.publicUrl =
      config.get<string>('AWS_S3_PUBLIC_URL') ??
      `${protocol}://${endpoint}:${port}`

    this.s3 = new S3Client({
      endpoint: `${protocol}://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.getOrThrow<string>('AWS_S3_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow<string>('AWS_S3_SECRET_KEY')
      },
      forcePathStyle: true
    })
  }

  async upload(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop()
    const key = `${folder}/${crypto.randomUUID()}.${ext}`

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    )

    return `${this.publicUrl}/${this.bucket}/${key}`
  }

  async delete(url: string): Promise<void> {
    const prefix = `${this.publicUrl}/${this.bucket}/`
    const key = url.startsWith(prefix) ? url.slice(prefix.length) : url

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
    )
  }
}
