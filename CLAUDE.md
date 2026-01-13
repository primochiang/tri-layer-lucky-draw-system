# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個三層式抽獎系統（Tri-Layer Lucky Draw System），專為活動抽獎場景設計。使用 React 19 + TypeScript + Vite 建構，並使用 Tailwind CSS（透過 CDN 載入）進行樣式設計。

## 常用指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（預設 port 3000）
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 架構說明

### 三層抽獎邏輯

系統的核心是三層式抽獎機制，定義於 `types.ts` 的 `LayerType` 枚舉：

- **Layer A（全體抽獎）**：所有參加者皆可參與
- **Layer B（分區抽獎）**：依分區（Zone）篩選參加者
- **Layer C（社團抽獎）**：依社團（Club）篩選參加者

**重要規則**：跨層級中獎是允許的（在 A 層中獎不影響 B 或 C 層的資格），但同一層級內不可重複中獎。

### 抽獎資格判斷

`services/lotteryService.ts` 提供兩個核心函式：

- `getEligibleParticipants()`：根據層級和過濾條件（分區/社團）計算符合資格的參加者，並排除該層級已中獎者
- `drawWinners()`：使用 Fisher-Yates 演算法隨機抽出指定數量的中獎者

### 元件結構

- `App.tsx`：主應用程式，包含所有狀態管理和業務邏輯
- `components/SlotMachine.tsx`：抽獎動畫效果（老虎機式滾動顯示）
- `components/LayerSelector.tsx`：層級選擇器
- `components/WinnersList.tsx`：中獎名單顯示
- `components/Modal.tsx`：確認/提醒對話框
- `components/DanmakuSidebar.tsx`：彈幕留言側邊欄

### 資料流

1. `constants.ts` 提供模擬資料（`MOCK_PARTICIPANTS`）和輔助函式
2. `App.tsx` 管理所有狀態：參加者、中獎記錄、獎項設定、UI 狀態
3. 抽獎時透過 `lotteryService` 計算資格並抽出中獎者
4. 使用 `canvas-confetti` 產生中獎特效

### 樣式系統

- Tailwind CSS 透過 CDN 載入（見 `index.html`）
- 使用 Noto Sans TC 字體
- 自訂動畫定義於 `index.html` 的 `<style>` 區塊

## 環境變數

需要在 `.env.local` 設定 `GEMINI_API_KEY`（若使用 AI Studio 相關功能）。
