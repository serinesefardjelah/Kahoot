import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  query,
  where
} from '@angular/fire/firestore'
import { User } from '@angular/fire/auth'
import { setDoc } from 'firebase/firestore'

export interface UserWithAlias extends User {
  alias: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore)

  usersCollection = collection(this.firestore, 'users')

  create(user: UserWithAlias) {
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      alias: user.alias,
      email: user.email ?? ''
    })
  }

  getAll() {
    return collectionData(this.usersCollection, {
      idField: 'id'
    }) as Observable<UserWithAlias[]>
  }

  async getByAlias(alias: string): Promise<{ uid: string; email: string } | null> {
    const q = query(this.usersCollection, where('alias', '==', alias))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const data = snapshot.docs[0].data() as { alias: string; email: string }
    return { uid: snapshot.docs[0].id, email: data.email }
  }
}
