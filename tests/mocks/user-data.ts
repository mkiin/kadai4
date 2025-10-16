/**
 * ユーザー関連のモックデータ
 * 新スキーマ対応: user_idは数値型の自動採番
 */

export const mockUsers = {
  /** 全SNS情報ありのテストユーザー */
  fullProfile: {
    user_id: 1,
    name: "全SNS情報あり",
    description: "これはテスト用の自己紹介文です。",
    github_id: "test_github",
    qiita_id: "test_qiita",
    x_id: "test_twitter",
    created_at: "2024-01-01T00:00:00Z",
    user_skill: [
      {
        skills: {
          skill_id: 1,
          name: "React",
        },
      },
    ],
  },

  /** SNS情報なしのユーザー */
  noSocialMedia: {
    user_id: 2,
    name: "SNS情報なし",
    description: "Test description",
    github_id: null,
    qiita_id: null,
    x_id: null,
    created_at: "2024-01-01T00:00:00Z",
    user_skill: [],
  },

  /** スキル情報なしのユーザー */
  noSkills: {
    user_id: 3,
    name: "スキルなし",
    description: "技術なし",
    github_id: null,
    qiita_id: null,
    x_id: null,
    created_at: "2024-01-01T00:00:00Z",
    user_skill: [],
  },
};

/** ユーザー一覧（user_idとnameのみ） */
export const mockUsersList = [
  { user_id: 1, name: mockUsers.fullProfile.name },
  { user_id: 2, name: mockUsers.noSocialMedia.name },
  { user_id: 3, name: mockUsers.noSkills.name },
];
