import { S3, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import envConfig from '../config'
import { Upload } from '@aws-sdk/lib-storage'
import { readFileSync } from 'fs'

@Injectable()
export class S3Service {
  private s3: S3
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
      },
    })

    // test connect s3
    this.s3
      .listBuckets({})
      .then((res) => {
        if (res?.$metadata?.httpStatusCode === 200) {
          console.log('Connected to S3')
        } else {
          console.log('Failed to connect to S3')
        }
      })
      .catch((err) => {
        console.log('Failed to connect to S3', err)
      })
  }
  uploadFile({ fileName, filePath, contentType }: { fileName: string; filePath: string; contentType: string }) {
    try {
      const parallelUploads3 = new Upload({
        client: this.s3,
        params: {
          Bucket: envConfig.S3_BUCKET_NAME,
          Key: fileName,
          Body: readFileSync(filePath),
          ContentType: contentType,
        },

        tags: [],
        queueSize: 4,
        partSize: 1024 * 1024 * 5,
        leavePartsOnError: false,
      })

      parallelUploads3.on('httpUploadProgress', (progress) => {
        console.log('progress', progress)
      })

      return parallelUploads3.done()
    } catch (e) {
      console.log('error', e)
    }
  }
}
