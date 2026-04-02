import React from 'react';
import { Card as PaperCard } from 'react-native-paper';
import type { CardProps as PaperCardProps } from 'react-native-paper';

export type { PaperCardProps as CardProps };

/**
 * Moni Card component.
 * Re-exports React Native Paper's Card with the brand theme applied.
 */
export const Card = PaperCard;
export const CardContent = PaperCard.Content;
export const CardTitle = PaperCard.Title;
export const CardActions = PaperCard.Actions;
