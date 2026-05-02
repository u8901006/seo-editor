export type EditorRole = 'nineGrid' | 'sourcing' | 'positioning' | 'branding'

export interface EditorConfig {
  id: EditorRole
  name: string
  icon: string
  description: string
}

export interface ReviewState {
  status: 'idle' | 'loading' | 'done' | 'error'
  content: string
  error?: string
}

export const EDITORS: EditorConfig[] = [
  {
    id: 'nineGrid',
    name: '九宮格寫作法',
    icon: ' sudoku',
    description: '以自問自答、7W3H、資訊/感受雙引擎角度審查文章結構',
  },
  {
    id: 'sourcing',
    name: '取材編輯',
    icon: '🔍',
    description: '以內容三角、稀有性、鏡射性、結構強韌性角度審查內容品質',
  },
  {
    id: 'positioning',
    name: '定位編輯',
    icon: '🎯',
    description: '以讀者心智位置、搜尋意圖、差異化角度審查文章定位',
  },
  {
    id: 'branding',
    name: '品牌文案',
    icon: '✨',
    description: '以品牌承諾、目標受眾、感覺承諾、轉行測試角度審查品牌力',
  },
]
