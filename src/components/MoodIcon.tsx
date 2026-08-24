import { Frown, Annoyed, Meh, Smile, Laugh } from 'lucide-react'
import { MOOD_EMOJIS } from '../lib/constants'

const MOOD_ICONS = [Frown, Annoyed, Meh, Smile, Laugh]

interface MoodIconProps {
  mood: string
  size?: number
}

export default function MoodIcon({ mood, size = 20 }: MoodIconProps) {
  const index = MOOD_EMOJIS.indexOf(mood)
  const Icon = MOOD_ICONS[index] ?? Meh
  return <Icon size={size} strokeWidth={2} />
}
