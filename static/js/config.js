export const API_BASE = window.API_BASE_URL || '';

export const thinkingMessages = [
    '回答を分析しています…',
    '最適なフィードバックをまとめています…',
    '次の質問を準備しています…',
];

export const DASHBOARD_SKILLS = ['logic', 'specificity', 'expression', 'proactive', 'selfaware'];

export const SKILL_LABELS = {
    logic: '論理構成力',
    specificity: '内容具体性',
    expression: '表現力',
    proactive: '積極性・意欲',
    selfaware: '自己理解度',
};

export const PROFILE_STORAGE_KEY_BASE = 'poken_profile_v1';
export const DEFAULT_AVATAR_SRC = 'static/photo/default.png';

export const PROFILE_STATUS_DESCRIPTIONS = {
    書類選考: '応募書類の選考が進行中です。提出した資料を見直し、次のステップに備えましょう。',
    一次面接: '一次面接の段階です。想定問答や企業研究を引き続き行いましょう。',
    二次面接: '一次面接を通過しました。より深い質問に備えて準備を整えてください。',
    最終面接: '最終面接を控えています。志望動機や自分の強みを改めて整理しましょう。',
    内定: '内定おめでとうございます！条件確認や入社準備を進めましょう。',
};

export const PCM_TARGET_SAMPLE_RATE = 16000;
