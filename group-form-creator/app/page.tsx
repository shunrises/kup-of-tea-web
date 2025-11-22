"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  PlusCircle,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  User,
  Users,
  GripVertical,
  Info,
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// 그룹 타입 확장
type GroupType = "female_solo" | "male_solo" | "coed_group" | "girl_group" | "boy_group"

type Member = {
  id: string
  name: string
  profileImage: string | null
}

type Step = {
  id: number
  title: string
}

type FormErrors = {
  groupName?: string
  groupType?: string
  logoImage?: string
  members?: {
    [key: string]: {
      name?: string
      profileImage?: string
    }
  }
}

// 그룹 타입별 한글 이름 매핑
const groupTypeLabels: Record<GroupType, string> = {
  female_solo: "여자 솔로",
  male_solo: "남자 솔로",
  coed_group: "혼성 그룹",
  girl_group: "걸그룹",
  boy_group: "보이그룹",
}

// 그룹 타입별 아이콘 매핑
const groupTypeIcons: Record<GroupType, React.ReactNode> = {
  female_solo: <User className="h-5 w-5" />,
  male_solo: <User className="h-5 w-5" />,
  coed_group: <Users className="h-5 w-5" />,
  girl_group: <Users className="h-5 w-5" />,
  boy_group: <Users className="h-5 w-5" />,
}

// 그룹 타입별 설명 매핑
const groupTypeDescriptions: Record<GroupType, string> = {
  female_solo: "여성 솔로 아티스트",
  male_solo: "남성 솔로 아티스트",
  coed_group: "남녀 혼성으로 구성된 그룹",
  girl_group: "여성으로만 구성된 그룹",
  boy_group: "남성으로만 구성된 그룹",
}

// 멤버 항목 컴포넌트 (드래그 가능)
interface SortableMemberItemProps {
  member: Member
  index: number
  isSoloArtist: boolean
  onRemove: (id: string) => void
  onNameChange: (value: string, id: string) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  errors?: {
    name?: string
    profileImage?: string
  }
}

function SortableMemberItem({
  member,
  index,
  isSoloArtist,
  onRemove,
  onNameChange,
  onImageUpload,
  errors,
}: SortableMemberItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg relative ${isDragging ? "border-primary" : ""}`}
    >
      {!isSoloArtist && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab touch-none flex items-center h-full"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {!isSoloArtist && index > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => onRemove(member.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isSoloArtist ? "pl-6" : ""}`}>
        <div className="space-y-2">
          <Label htmlFor={`memberName-${member.id}`}>{isSoloArtist ? "활동명" : "멤버 이름"}</Label>
          <Input
            id={`memberName-${member.id}`}
            value={member.name}
            onChange={(e) => onNameChange(e.target.value, member.id)}
            placeholder={isSoloArtist ? "활동명을 입력하세요" : "멤버 이름을 입력하세요"}
            required
          />
          {errors?.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`memberImage-${member.id}`}>프로필 사진</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
              {member.profileImage ? (
                <Image
                  src={member.profileImage || "/placeholder.svg"}
                  alt={`${member.name || "멤버"} 프로필`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <input
                type="file"
                id={`memberImage-${member.id}`}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => onImageUpload(e, member.id)}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {member.profileImage ? "사진이 업로드되었습니다" : "프로필 사진을 업로드해주세요"}
            </div>
          </div>
          {errors?.profileImage && <p className="text-sm text-destructive mt-1">{errors.profileImage}</p>}
        </div>
      </div>
    </div>
  )
}

export default function MusicGroupForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [groupName, setGroupName] = useState("")
  const [groupType, setGroupType] = useState<GroupType | null>(null)
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([{ id: "1", name: "", profileImage: null }])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // DnD 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이상 움직여야 드래그 시작
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const steps: Step[] = [
    { id: 1, title: "그룹 타입" },
    { id: 2, title: "기본 정보" },
    { id: 3, title: "멤버 정보" },
    { id: 4, title: "검토 및 제출" },
  ]

  // 그룹 타입 변경 시 멤버 초기화
  const handleGroupTypeChange = (value: GroupType) => {
    setGroupType(value)

    // 솔로 타입인 경우 멤버 1명으로 초기화
    if (value === "female_solo" || value === "male_solo") {
      setMembers([{ id: "1", name: "", profileImage: null }])
    } else {
      // 그룹 타입인 경우 멤버 2명으로 초기화
      setMembers([
        { id: "1", name: "", profileImage: null },
        { id: "2", name: "", profileImage: null },
      ])
    }

    // 그룹 타입 에러 초기화
    setErrors((prev) => ({ ...prev, groupType: undefined }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logoImage: "이미지 크기는 5MB 이하여야 합니다." }))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoImage(e.target?.result as string)
        setErrors((prev) => ({ ...prev, logoImage: undefined }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGroupName(value)

    // 실시간 유효성 검사 - 1글자도 허용
    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, groupName: "그룹 이름을 입력해주세요." }))
    } else {
      setErrors((prev) => ({ ...prev, groupName: undefined }))
    }
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 검사 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          members: {
            ...prev.members,
            [memberId]: {
              ...prev.members?.[memberId],
              profileImage: "이미지 크기는 5MB 이하여야 합니다.",
            },
          },
        }))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setMembers(
          members.map((member) =>
            member.id === memberId ? { ...member, profileImage: e.target?.result as string } : member,
          ),
        )

        // 에러 초기화
        setErrors((prev) => ({
          ...prev,
          members: {
            ...prev.members,
            [memberId]: {
              ...prev.members?.[memberId],
              profileImage: undefined,
            },
          },
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMemberNameChange = (value: string, memberId: string) => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, name: value } : member)))

    // 실시간 유효성 검사 - 1글자도 허용
    if (value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        members: {
          ...prev.members,
          [memberId]: {
            ...prev.members?.[memberId],
            name: "멤버 이름을 입력해주세요.",
          },
        },
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        members: {
          ...prev.members,
          [memberId]: {
            ...prev.members?.[memberId],
            name: undefined,
          },
        },
      }))
    }
  }

  const addMember = () => {
    // 솔로가 아닌 그룹 타입인 경우에만 멤버 추가 가능
    if (groupType && groupType !== "female_solo" && groupType !== "male_solo") {
      setMembers([...members, { id: Date.now().toString(), name: "", profileImage: null }])
    }
  }

  const removeMember = (memberId: string) => {
    if (members.length > 2) {
      setMembers(members.filter((member) => member.id !== memberId))

      // 삭제된 멤버의 에러 정보도 제거
      setErrors((prev) => {
        const updatedMemberErrors = { ...prev.members }
        delete updatedMemberErrors[memberId]
        return { ...prev, members: updatedMemberErrors }
      })
    }
  }

  // 멤버 순서 변경 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const validateStep = (step: number): boolean => {
    let isValid = true
    const newErrors: FormErrors = {}

    switch (step) {
      case 1: // 그룹 타입
        if (!groupType) {
          newErrors.groupType = "그룹 타입을 선택해주세요."
          isValid = false
        }
        break
      case 2: // 기본 정보
        if (!logoImage) {
          newErrors.logoImage = "그룹 로고를 업로드해주세요."
          isValid = false
        }
        if (!groupName.trim()) {
          newErrors.groupName = "그룹 이름을 입력해주세요."
          isValid = false
        }
        break
      case 3: // 멤버 정보
        const memberErrors: { [key: string]: { name?: string; profileImage?: string } } = {}

        members.forEach((member) => {
          const memberError: { name?: string; profileImage?: string } = {}

          if (!member.name.trim()) {
            memberError.name = "멤버 이름을 입력해주세요."
            isValid = false
          }

          if (!member.profileImage) {
            memberError.profileImage = "프로필 사진을 업로드해주세요."
            isValid = false
          }

          if (Object.keys(memberError).length > 0) {
            memberErrors[member.id] = memberError
          }
        })

        if (Object.keys(memberErrors).length > 0) {
          newErrors.members = memberErrors
        }
        break
    }

    setErrors(newErrors)
    return isValid
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 모든 단계 유효성 검사
    for (let i = 1; i <= 3; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Rails 백엔드로 데이터 전송
      const response = await fetch("https://your-rails-backend.com/api/music_groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          music_group: {
            name: groupName,
            group_type: groupType,
            logo_image: logoImage,
            members: members.map((member) => ({
              name: member.name,
              profile_image: member.profileImage,
            })),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("서버 응답이 올바르지 않습니다.")
      }

      const data = await response.json()

      toast({
        title: "성공!",
        description: "음악 그룹 정보가 성공적으로 저장되었습니다.",
      })

      // 폼 초기화 또는 다른 페이지로 리디렉션
      // window.location.href = '/success'
    } catch (error) {
      console.error("제출 오류:", error)
      toast({
        title: "오류 발생",
        description: "정보 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 솔로 아티스트인지 확인하는 함수
  const isSoloArtist = () => {
    return groupType === "female_solo" || groupType === "male_solo"
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // 그룹 타입
        return (
          <>
            <div className="space-y-4">
              <Label>그룹 타입</Label>
              <RadioGroup
                value={groupType || ""}
                onValueChange={(value) => handleGroupTypeChange(value as GroupType)}
                className="flex flex-col space-y-4"
                required
              >
                {/* 솔로 아티스트 옵션 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="female_solo" id="female_solo" />
                    <Label htmlFor="female_solo" className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {groupTypeIcons.female_solo}
                        {groupTypeLabels.female_solo}
                      </div>
                      <p className="text-sm text-muted-foreground">{groupTypeDescriptions.female_solo}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="male_solo" id="male_solo" />
                    <Label htmlFor="male_solo" className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {groupTypeIcons.male_solo}
                        {groupTypeLabels.male_solo}
                      </div>
                      <p className="text-sm text-muted-foreground">{groupTypeDescriptions.male_solo}</p>
                    </Label>
                  </div>
                </div>

                {/* 그룹 옵션 */}
                <div className="mt-4 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">그룹 타입</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="girl_group" id="girl_group" />
                    <Label htmlFor="girl_group" className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {groupTypeIcons.girl_group}
                        {groupTypeLabels.girl_group}
                      </div>
                      <p className="text-sm text-muted-foreground">{groupTypeDescriptions.girl_group}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="boy_group" id="boy_group" />
                    <Label htmlFor="boy_group" className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {groupTypeIcons.boy_group}
                        {groupTypeLabels.boy_group}
                      </div>
                      <p className="text-sm text-muted-foreground">{groupTypeDescriptions.boy_group}</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="coed_group" id="coed_group" />
                    <Label htmlFor="coed_group" className="cursor-pointer flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {groupTypeIcons.coed_group}
                        {groupTypeLabels.coed_group}
                      </div>
                      <p className="text-sm text-muted-foreground">{groupTypeDescriptions.coed_group}</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              {errors.groupType && <p className="text-sm text-destructive mt-1">{errors.groupType}</p>}
            </div>
          </>
        )
      case 2: // 기본 정보
        return (
          <>
            {/* 로고 업로드 */}
            <div className="space-y-2">
              <Label htmlFor="logo">그룹 로고</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-32 w-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                  {logoImage ? (
                    <Image src={logoImage || "/placeholder.svg"} alt="Group Logo" fill className="object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {logoImage ? "로고가 업로드되었습니다" : "로고 이미지를 업로드해주세요"}
                </div>
              </div>
              {errors.logoImage && <p className="text-sm text-destructive mt-1">{errors.logoImage}</p>}
            </div>

            {/* 그룹 이름 */}
            <div className="space-y-2">
              <Label htmlFor="groupName">{isSoloArtist() ? "아티스트 이름" : "그룹 이름"}</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={handleGroupNameChange}
                placeholder={isSoloArtist() ? "아티스트 이름을 입력하세요" : "그룹 이름을 입력하세요"}
                required
              />
              {errors.groupName && <p className="text-sm text-destructive mt-1">{errors.groupName}</p>}
            </div>
          </>
        )
      case 3: // 멤버 정보
        return (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>멤버 정보</Label>
                {!isSoloArtist() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMember}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    멤버 추가
                  </Button>
                )}
              </div>

              {/* 멤버 순서 안내 메시지 */}
              <Alert variant="default" className="bg-muted/50 border-muted">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {isSoloArtist()
                    ? "아티스트 정보를 입력해주세요."
                    : "멤버를 공식 순서에 맞게 정렬해주세요. 드래그하여 순서를 변경할 수 있습니다."}
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  // 솔로 아티스트인 경우 드래그 비활성화
                  disabled={isSoloArtist()}
                >
                  <SortableContext items={members.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    {members.map((member, index) => (
                      <SortableMemberItem
                        key={member.id}
                        member={member}
                        index={index}
                        isSoloArtist={isSoloArtist()}
                        onRemove={removeMember}
                        onNameChange={handleMemberNameChange}
                        onImageUpload={handleProfileImageUpload}
                        errors={errors.members?.[member.id]}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </>
        )
      case 4: // 검토 및 제출
        return (
          <>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isSoloArtist() ? "아티스트 이름" : "그룹 이름"}
                    </p>
                    <p>{groupName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">그룹 타입</p>
                    <p>{groupType ? groupTypeLabels[groupType] : ""}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isSoloArtist() ? "아티스트 로고" : "그룹 로고"}
                  </p>
                  {logoImage && (
                    <div className="mt-1">
                      <Image
                        src={logoImage || "/placeholder.svg"}
                        alt="Group Logo"
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">{isSoloArtist() ? "아티스트 정보" : "멤버 정보"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {members.map((member, index) => (
                    <div key={member.id} className="border rounded-lg p-3">
                      {!isSoloArtist() && (
                        <div className="text-xs font-medium text-muted-foreground mb-1">멤버 {index + 1}</div>
                      )}
                      {member.profileImage && (
                        <div className="mb-2">
                          <Image
                            src={member.profileImage || "/placeholder.svg"}
                            alt={`${member.name} 프로필`}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <p className="font-medium">{member.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">음악 그룹 프로필 생성</CardTitle>
          <CardDescription>그룹 또는 솔로 아티스트의 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* 진행 상태 표시 */}
            <div className="flex justify-between mb-8">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep === step.id ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* 단계별 콘텐츠 - 애니메이션 적용 */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> 이전
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                다음 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 제출 중...
                  </>
                ) : (
                  "제출하기"
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
