---
description: Auto-runs on first install - Savant setup wizard
runOnInstall: true
---

# Welcome to Claude Code Savant! 🎭

Thank you for installing **Claude Code Savant** - your expert AI personas for better explanations!

## Let's Set Up Your Preferences

I'll help you configure Savant with a quick setup.

### Step 1: Language Selection

Use AskUserQuestion:

```
AskUserQuestion:
- question: "Which language should Savant respond in?"
- header: "Language"
- options:
  - label: "English (Recommended)"
    description: "Responses in English"
  - label: "한국어 (Korean)"
    description: "한국어로 응답합니다"
  - label: "日本語 (Japanese)"
    description: "日本語で応答します"
  - label: "中文 (Chinese)"
    description: "用中文回复"
```

### Step 2: Default Mode

Use AskUserQuestion:

```
AskUserQuestion:
- question: "Enable auto-routing? (Analyzes ALL questions automatically)"
- header: "Default Mode"
- options:
  - label: "Yes, enable auto-routing (Recommended)"
    description: "Every question automatically goes to the best persona"
  - label: "No, I'll use commands manually"
    description: "Use /savant or specific commands when needed"
```

### Step 3: Show Welcome Message

Based on selected language, display the appropriate welcome:

#### English
```
## ✅ Setup Complete!

### Your Savant Personas:
| Persona | Command | Specialty |
|---------|---------|-----------|
| 🧠 Einstein | /savant-question | Deep conceptual explanations |
| 🎭 Shakespeare | /savant-code | Code narratives with flowcharts |
| 💡 Steve Jobs | /savant-new | Visionary project direction |
| 🔍 Socrates | /savant-fix | Error debugging & root cause |

### Quick Start:
[If default mode enabled]
Just ask any question naturally! I'll analyze and route it automatically.

[If default mode disabled]
Use `/savant [question]` for smart routing, or use specific commands above.

### Settings:
- `/savant-lang` - Change language
- `/savant-default` / `/savant-default-off` - Toggle auto-routing

Enjoy! 🚀
```

#### Korean (한국어)
```
## ✅ 설정 완료!

### Savant 페르소나:
| 페르소나 | 명령어 | 전문 분야 |
|---------|--------|----------|
| 🧠 아인슈타인 | /savant-question | 깊은 개념 설명 |
| 🎭 셰익스피어 | /savant-code | 코드 분석 & 플로우차트 |
| 💡 스티브 잡스 | /savant-new | 프로젝트 방향 & 비전 |
| 🔍 소크라테스 | /savant-fix | 에러 디버깅 & 근본 원인 |

### 시작하기:
[디폴트 모드 활성화 시]
그냥 질문하세요! 자동으로 분석해서 최적의 페르소나로 연결합니다.

[디폴트 모드 비활성화 시]
`/savant [질문]`으로 스마트 라우팅하거나, 위의 명령어를 직접 사용하세요.

### 설정 변경:
- `/savant-lang` - 언어 변경
- `/savant-default` / `/savant-default-off` - 자동 라우팅 토글

즐겁게 사용하세요! 🚀
```

#### Japanese (日本語)
```
## ✅ セットアップ完了！

### Savantペルソナ:
| ペルソナ | コマンド | 専門分野 |
|---------|---------|----------|
| 🧠 アインシュタイン | /savant-question | 深い概念説明 |
| 🎭 シェイクスピア | /savant-code | コード分析＆フローチャート |
| 💡 スティーブ・ジョブズ | /savant-new | プロジェクトビジョン |
| 🔍 ソクラテス | /savant-fix | エラーデバッグ＆根本原因 |

### クイックスタート:
[デフォルトモード有効時]
質問するだけ！自動で分析して最適なペルソナに接続します。

[デフォルトモード無効時]
`/savant [質問]`でスマートルーティング、または上記コマンドを使用。

### 設定変更:
- `/savant-lang` - 言語変更
- `/savant-default` / `/savant-default-off` - 自動ルーティング切替

お楽しみください！🚀
```

#### Chinese (中文)
```
## ✅ 设置完成！

### Savant角色:
| 角色 | 命令 | 专长 |
|-----|------|-----|
| 🧠 爱因斯坦 | /savant-question | 深度概念解释 |
| 🎭 莎士比亚 | /savant-code | 代码分析和流程图 |
| 💡 乔布斯 | /savant-new | 项目愿景方向 |
| 🔍 苏格拉底 | /savant-fix | 错误调试和根因分析 |

### 快速开始:
[默认模式启用时]
直接提问！自动分析并路由到最佳角色。

[默认模式禁用时]
使用 `/savant [问题]` 智能路由，或直接使用上述命令。

### 设置更改:
- `/savant-lang` - 更改语言
- `/savant-default` / `/savant-default-off` - 切换自动路由

祝您使用愉快！🚀
```

### Step 4: Star the Project ⭐

Use AskUserQuestion:

```
AskUserQuestion:
- question: "If you find Savant helpful, would you like to give it a ⭐ on GitHub?"
- header: "Support"
- options:
  - label: "1. Yes, star now! (via gh CLI)"
    description: "Automatically star using GitHub CLI"
  - label: "2. Open GitHub page"
    description: "I'll star it manually on the website"
  - label: "Skip"
    description: "Maybe later"
```

#### If Option 1 (gh CLI):
Run the following command:
```bash
gh repo star rlaope/claude-code-savant
```

Then display:
```
⭐ Thank you for starring! Your support means a lot!
```

#### If Option 2 (Manual):
Display:
```
🔗 GitHub Repository: https://github.com/rlaope/claude-code-savant

Click the ⭐ Star button at the top right of the page.
Thank you for your support! 🙏
```

#### If Skip:
Display:
```
No problem! You can always star later at:
https://github.com/rlaope/claude-code-savant

Enjoy using Savant! 🎭
```
