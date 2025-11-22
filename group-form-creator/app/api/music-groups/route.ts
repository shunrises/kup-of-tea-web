import { type NextRequest, NextResponse } from "next/server"
import { MusicGroupService } from "@/lib/music-group-service"
import type { MusicGroupFormData } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const formData: MusicGroupFormData = await request.json()

    // 유효성 검사
    if (!formData.name || !formData.group_type || !formData.members?.length) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다." }, { status: 400 })
    }

    // 음악 그룹 생성
    const result = await MusicGroupService.createMusicGroup(formData)

    if (!result) {
      return NextResponse.json({ error: "음악 그룹 생성에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const groups = await MusicGroupService.getAllMusicGroups()
    return NextResponse.json({
      success: true,
      data: groups,
    })
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
