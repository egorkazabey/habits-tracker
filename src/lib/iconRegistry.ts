import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import {
  Dumbbell, Bike, Waves, Footprints, Trophy, Target,
  PersonStanding, Mountain, Volleyball, Timer, Flame, Snowflake,
  Apple, Coffee, UtensilsCrossed, GlassWater, Salad, Carrot,
  Egg, Fish, Cookie, Milk, Soup, IceCreamCone,
  BookOpen, PenLine, Brain, Moon, Sun, Heart,
  Wallet, Brush, Guitar, Camera, Bed, ShowerHead,
  Star, CheckCircle, Smile, Sparkles, Leaf, Cigarette,
  Ban, ThumbsUp, AlarmClock, Calendar, MapPin, Plane,
} from 'lucide-react'

/** Only the icons curated in HABIT_ICON_CATEGORIES — an explicit map so bundlers can tree-shake the rest of lucide-react. */
export const ICON_REGISTRY: Record<string, ComponentType<LucideProps>> = {
  Dumbbell, Bike, Waves, Footprints, Trophy, Target,
  PersonStanding, Mountain, Volleyball, Timer, Flame, Snowflake,
  Apple, Coffee, UtensilsCrossed, GlassWater, Salad, Carrot,
  Egg, Fish, Cookie, Milk, Soup, IceCreamCone,
  BookOpen, PenLine, Brain, Moon, Sun, Heart,
  Wallet, Brush, Guitar, Camera, Bed, ShowerHead,
  Star, CheckCircle, Smile, Sparkles, Leaf, Cigarette,
  Ban, ThumbsUp, AlarmClock, Calendar, MapPin, Plane,
}
