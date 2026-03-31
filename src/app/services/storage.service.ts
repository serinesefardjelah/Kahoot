import { inject, Injectable } from '@angular/core'
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '@angular/fire/storage'

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(Storage)

  async uploadQuestionImage(
    quizId: string,
    questionId: string,
    file: File
  ): Promise<string> {
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(
        `Image too large. Maximum size is 2MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB)`
      )
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    const path = `quizzes/${quizId}/questions/${questionId}/${Date.now()}_${file.name}`
    const storageRef = ref(this.storage, path)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }
}
