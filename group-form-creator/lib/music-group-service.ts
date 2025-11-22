import { supabase } from "./supabase-client"
import type { MusicGroupFormData, MusicGroup, Member } from "./types"

export class MusicGroupService {
  // 이미지 업로드 함수
  static async uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
      return null
    }
  }

  // base64를 File로 변환
  static base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(",")
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  // 음악 그룹 생성
  static async createMusicGroup(formData: MusicGroupFormData): Promise<MusicGroup | null> {
    try {
      // 1. 로고 이미지 업로드
      let logoImageUrl: string | null = null
      if (formData.logo_image) {
        const logoFile = this.base64ToFile(formData.logo_image, `logo-${Date.now()}.jpg`)
        logoImageUrl = await this.uploadImage(logoFile, "group-logos", `${Date.now()}-${logoFile.name}`)
      }

      // 2. 음악 그룹 데이터 삽입
      const { data: groupData, error: groupError } = await supabase
        .from("music_groups")
        .insert({
          name: formData.name,
          group_type: formData.group_type,
          logo_image_url: logoImageUrl,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // 3. 멤버 프로필 이미지 업로드 및 멤버 데이터 삽입
      const memberInserts = await Promise.all(
        formData.members.map(async (member, index) => {
          let profileImageUrl: string | null = null

          if (member.profile_image) {
            const profileFile = this.base64ToFile(member.profile_image, `profile-${Date.now()}-${index}.jpg`)
            profileImageUrl = await this.uploadImage(
              profileFile,
              "member-profiles",
              `${Date.now()}-${profileFile.name}`,
            )
          }

          return {
            music_group_id: groupData.id,
            name: member.name,
            profile_image_url: profileImageUrl,
            member_order: index + 1,
          }
        }),
      )

      const { error: membersError } = await supabase.from("members").insert(memberInserts)

      if (membersError) throw membersError

      return groupData
    } catch (error) {
      console.error("음악 그룹 생성 실패:", error)
      return null
    }
  }

  // 음악 그룹 조회 (멤버 포함)
  static async getMusicGroupWithMembers(id: string): Promise<MusicGroup | null> {
    try {
      const { data, error } = await supabase
        .from("music_groups")
        .select(`
          *,
          members (
            *
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      // 멤버를 순서대로 정렬
      if (data.members) {
        data.members.sort((a: Member, b: Member) => a.member_order - b.member_order)
      }

      return data
    } catch (error) {
      console.error("음악 그룹 조회 실패:", error)
      return null
    }
  }

  // 모든 음악 그룹 조회
  static async getAllMusicGroups(): Promise<MusicGroup[]> {
    try {
      const { data, error } = await supabase
        .from("music_groups")
        .select(`
          *,
          members (
            *
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // 각 그룹의 멤버를 순서대로 정렬
      return data.map((group) => ({
        ...group,
        members: group.members?.sort((a: Member, b: Member) => a.member_order - b.member_order) || [],
      }))
    } catch (error) {
      console.error("음악 그룹 목록 조회 실패:", error)
      return []
    }
  }

  // 멤버 순서 업데이트
  static async updateMemberOrder(groupId: string, memberOrders: { id: string; order: number }[]): Promise<boolean> {
    try {
      const updates = memberOrders.map(({ id, order }) =>
        supabase.from("members").update({ member_order: order }).eq("id", id).eq("music_group_id", groupId),
      )

      await Promise.all(updates)
      return true
    } catch (error) {
      console.error("멤버 순서 업데이트 실패:", error)
      return false
    }
  }
}
