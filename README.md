# Jisou App - 名刺管理アプリケーション

# 要件

- ユーザーIDを入力できる
- 入力しているIDの候補を出す
- 入力しているIDがない場合、エラーをだす。
- 入力しているIDがある場合、/card/{id}にリダイレクトする

# 機能

- コンボボックスコンポーネントでIDを入力することができる
- tanstack queryにより、初回ロードでidセットを取得する
- もしくは、入力中にget queryをするか？
  - 前者の方法なら、idセット内に無いidを入力した場合に、エラー表示
  - 後者の方法なら、queryエラーによりエラー表示
- zodスキーマは使用しない。react hoook formのネイティブバリデーションで対応する。

## データベース構造

### ER図

```mermaid
erDiagram
    users ||--o{ user_skill : "1人のユーザーは複数のスキルを持つ"
    skills ||--o{ user_skill : "1つのスキルは複数のユーザーに関連"

    users {
        string user_id PK "ユーザーID（主キー）"
        string name "ユーザー名"
        string description "自己紹介"
        string github_id "GitHub ID（nullable）"
        string qiita_id "Qiita ID（nullable）"
        string x_id "X ID（nullable）"
        string created_at "作成日時"
    }

    skills {
        number skill_id PK "スキルID（主キー・自動採番）"
        string name "スキル名"
        string created_at "作成日時"
    }

    user_skill {
        number id PK "レコードID（主キー・自動採番）"
        string user_id FK "ユーザーID（外部キー）"
        number skill_id FK "スキルID（外部キー）"
        string created_at "作成日時"
    }
```

### テーブル説明

#### users テーブル
- ユーザーの基本情報を格納
- `user_id`は好きな単語をユニークIDとして使用
- SNSアカウント情報はオプション

#### skills テーブル
- 技術スキルのマスターデータ
- 予め登録された技術の一覧

#### user_skill テーブル
- usersとskillsの中間テーブル
- 多対多の関係を実現
- 1人のユーザーは最大3つまでのスキルを選択可能（アプリケーション制約）

### リレーション
- users 1 : N user_skill (1人のユーザーは複数のスキルを持てる)
- skills 1 : N user_skill (1つのスキルは複数のユーザーが持てる)
- user_skill テーブルにより、users と skills は多対多の関係