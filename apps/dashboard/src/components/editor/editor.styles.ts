'use client'

import styled, { css } from 'styled-components'

export const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'toolbar toolbar toolbar'
    'palette canvas inspector';
  height: calc(100dvh - 49px);
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.color.foreground};
`

export const Toolbar = styled.div`
  grid-area: toolbar;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.background};
`

export const Panel = styled.aside<{ $area: 'palette' | 'inspector' }>`
  grid-area: ${({ $area }) => $area};
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.color.background};
  border-inline: 1px solid ${({ theme }) => theme.color.border};
`

export const CanvasScroll = styled.div`
  grid-area: canvas;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.lg};
`

export const CanvasSheet = styled.div`
  background: ${({ theme }) => theme.color.background};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.space.lg};
  margin-inline: auto;
  max-width: var(--preview-width, 1100px);
`

export const PaletteItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.sm};
  margin-bottom: ${({ theme }) => theme.space.xs};
  border: 1px dashed ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  color: inherit;
  cursor: grab;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.color.accent};
  }
`

export const GroupLabel = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.color.foreground};
  opacity: 0.6;
  margin: ${({ theme }) => `${theme.space.md} 0 ${theme.space.xs}`};
`

export const SelectableWrap = styled.div<{ $selected?: boolean }>`
  position: relative;
  cursor: pointer;
  outline-offset: 2px;
  ${({ $selected, theme }) =>
    $selected &&
    css`
      outline: 2px solid ${theme.color.accent};
      border-radius: 2px;
    `}
  &:hover {
    outline: 1px dashed ${({ theme }) => theme.color.accent};
  }
`

export const TreeRegion = styled.div<{ $active?: boolean; $blocked?: boolean }>`
  border: 1px dashed
    ${({ theme, $active, $blocked }) =>
      $blocked ? theme.color.danger : $active ? theme.color.accent : theme.color.border};
  background: ${({ theme, $active }) => ($active ? theme.color.muted : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => theme.space.xs};
  margin: ${({ theme }) => theme.space.xs} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`

export const TreeNode = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  padding: 2px ${({ theme }) => theme.space.xs};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: grab;
  background: ${({ theme, $selected }) => ($selected ? theme.color.accent : 'transparent')};
  color: ${({ theme, $selected }) => ($selected ? theme.color.background : 'inherit')};
`

export const Field = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  > span {
    display: block;
    margin-bottom: ${({ theme }) => theme.space.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: ${({ theme }) => theme.space.xs};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.radius.sm};
    background: ${({ theme }) => theme.color.background};
    color: inherit;
    font: inherit;
  }
`
