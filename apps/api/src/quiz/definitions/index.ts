import { adhdQuizV1 } from './adhd-v1';

/**
 * Every quiz version ever published. Versions are append-only: to change the
 * quiz, add a new entry with a higher version instead of editing an old one.
 * The last entry of each quiz is the one that gets activated.
 */
export const QUIZ_VERSIONS = [adhdQuizV1];
