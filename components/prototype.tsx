'use client';

import type { ImgHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

import {
  ApiIcon,
  ArrowLeftIcon,
  BellIcon,
  BuildsIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  CommentIcon,
  CopyIcon,
  CreditCardIcon,
  CrossIcon,
  DatabaseIcon,
  DevelopmentIcon,
  EditIcon,
  ExpandIcon,
  ExternalLinkIcon,
  FilterIcon,
  GlobeIcon,
  HomeIcon,
  InputIcon,
  LayoutSidebarIcon,
  McpIcon,
  MonitoringIcon,
  MoreIcon,
  PlayIcon,
  PuzzleIcon,
  QuestionMarkIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparkleIcon,
  StorageIcon,
  TasksIcon,
} from '@apify/ui-icons';
import type { IconComponent } from '@apify/ui-icons';
import {
  ActorAvatar,
  Badge,
  Button,
  CheckboxPrimitive,
  cssColorsVariablesDark,
  cssColorsVariablesLight,
  Dropdown,
  DropdownButton,
  IconButton,
  ICON_BUTTON_VARIANTS,
  SelectPrimitive,
  Tabs,
  Tag,
  theme,
  Tooltip,
  UiDependencyProvider,
  type AgnosticInternalLinkProps,
  type TabData,
  type UiDependencies,
  UserAvatar,
} from '@apify/ui-library';

import { ActorInfoView } from './actor-info';

type Mode = 'run' | 'server';
type SplitMode = 'input' | 'server';
type NavigationVariant =
  | 'inline'
  | 'split'
  | 'detached'
  | 'disabled'
  | 'inline-v2'
  | 'inline-separated'
  | 'detached-above'
  | 'detached-above-labeled'
  | 'detached-above-trailing-label';
type OnboardingFlow = 'standby' | 'reshuffle';
type PrototypeView = 'prototype' | 'actor-info';

const ApifyTokens = createGlobalStyle`
  :root {
    ${cssColorsVariablesLight}
  }

  [data-flow-highlight='true'] {
    position: relative;
    z-index: 40;
    border-radius: 6px;
    outline: 1px solid color-mix(in srgb, ${theme.color.primary.action} 45%, transparent);
    outline-offset: 2px;
    box-shadow: 0 0 0 3px color-mix(in srgb, ${theme.color.primary.action} 7%, transparent);
  }

  .control-center-menu {
    ${cssColorsVariablesDark}
  }

  .control-center-select {
    border-color: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
  }

  .control-center-select:hover,
  .control-center-select[data-state='open'] {
    border-color: transparent !important;
    background-color: ${theme.color.primaryBlack.backgroundHover} !important;
    background-image: none !important;
  }

  .control-center-select:active {
    background-color: ${theme.color.primaryBlack.backgroundHover} !important;
    background-image: none !important;
  }
`;

const InternalLink = forwardRef<HTMLAnchorElement, AgnosticInternalLinkProps>(function InternalLink(
  { href, children, ...props },
  ref,
) {
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  );
});

const InternalImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(function InternalImage(
  props,
  ref,
) {
  return <img ref={ref} {...props} />;
});

const dependencies: UiDependencies = {
  InternalLink,
  InternalImage,
  windowLocationHost: 'localhost',
  isHrefTrusted: () => true,
  tooltipSafeHtml: (content: ReactNode) => content,
};

const Shell = styled.main<{ $sidebarCompact: boolean }>`
  display: grid;
  grid-template-columns: ${({ $sidebarCompact }) => ($sidebarCompact ? '41px' : '220px')} minmax(0, 1fr);
  width: 100vw;
  min-width: 1024px;
  height: 100vh;
  min-height: 640px;
  background: ${theme.color.neutral.background};
  transition: grid-template-columns ${theme.transition.smoothEaseOut};
`;

const SidebarTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 8px;
`;

const Account = styled.button`
  display: flex;
  width: 100%;
  height: 40px;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${theme.color.neutral.text};
  cursor: pointer;
  text-align: left;
  transition-property: background-color;
  transition-duration: 120ms;

  &:hover {
    background: ${theme.color.neutral.backgroundSubtle};
  }
`;

const AccountCopy = styled.span`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

const AccountName = styled.span`
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: ${theme.color.neutral.text};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountPlan = styled.span`
  font-size: 12px;
  line-height: 16px;
  color: ${theme.color.neutral.textSubtle};
`;

const SidebarSearchRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
`;

const SearchBox = styled.button`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  height: 28px;
  padding: 0 4px 0 8px;
  gap: 4px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  color: ${theme.color.neutral.icon};
  background: ${theme.color.neutral.backgroundMuted};
  cursor: pointer;

  &:hover {
    border-color: ${theme.color.primary.fieldBorderActive};
    background: ${theme.color.neutral.background};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.action};
    outline-offset: 2px;
  }
`;

const SearchLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: ${theme.color.neutral.textPlaceholder};
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Shortcut = styled.kbd`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 4px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 4px;
  font-family: var(--font-sans), sans-serif;
  font-size: 10px;
  line-height: 14px;
  color: ${theme.color.neutral.textSubtle};
  background: ${theme.color.neutral.backgroundMuted};
  white-space: nowrap;
`;

const NotificationButton = styled.button`
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  padding: 0;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.text};
  cursor: pointer;
  transition-property: background-color, border-color;
  transition-duration: 120ms;

  &:hover {
    border-color: ${theme.color.primary.fieldBorderActive};
    background: ${theme.color.neutral.background};
  }

  &::after {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    border: 1px solid white;
    border-radius: 50%;
    background: #d81b3a;
    content: '';
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
  }
`;

const NavDivider = styled.div`
  width: 100%;
  height: 0;
  flex: 0 0 auto;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
`;

const NavSection = styled.div<{ $bottom?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $bottom }) => ($bottom ? '4px' : '6px')};
  padding: ${({ $bottom }) => ($bottom ? '0 8px 12px' : '8px 8px 0')};
`;

const NavSpacer = styled.div`
  flex: 1;
`;

const NavItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  position: relative;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 28px;
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  color: ${theme.color.neutral.text};
  background: ${({ $selected }) => ($selected ? theme.color.neutral.backgroundSubtle : 'transparent')};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  text-align: left;
  transition-property: background-color, color;
  transition-duration: 120ms;

  &:hover {
    background: ${theme.color.neutral.backgroundSubtle};
  }

  svg {
    flex: 0 0 auto;
    color: ${theme.color.neutral.textSubtle};
  }
`;

const NavItemLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DevelopmentGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0 4px;
`;

const SectionLabel = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${theme.color.neutral.textSubtle};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;

  &:hover {
    background: ${theme.color.neutral.backgroundSubtle};
  }

  svg {
    transition-property: transform;
    transition-duration: 150ms;
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
`;

const DevelopmentItems = styled.div`
  display: flex;
  width: calc(100% - 8px);
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
`;

const UsageBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid ${theme.color.neutral.separatorSubtle};
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  color: ${theme.color.neutral.textMuted};
  font-size: 12px;
  line-height: 16px;
`;

const UsageLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  strong {
    font-weight: 600;
  }
`;

const SidebarFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  gap: 8px;
  padding: 12px 16px;
`;

const ApifyLogo = styled.img`
  display: block;
  width: 60px;
  height: 17px;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const compactSidebar = css`
  ${SidebarTop} {
    padding: 0;
  }

  ${Account} {
    height: 48px;
    justify-content: center;
    padding: 8px;
  }

  ${AccountCopy},
  ${SearchLabel},
  ${Shortcut},
  ${NavItemLabel},
  ${SectionLabel} span,
  ${ApifyLogo},
  ${UsageBox},
  .nav-disclosure {
    display: none;
  }

  ${SidebarSearchRow},
  ${FooterActions} {
    flex-direction: column;
  }

  ${SidebarSearchRow} {
    gap: 8px;
    padding: 0 6px 5px;
  }

  ${SearchBox} {
    width: 28px;
    flex: 0 0 28px;
    justify-content: center;
    padding: 0;
  }

  ${NavSection} {
    padding: 6px;
  }

  ${NavItem},
  ${SectionLabel} {
    justify-content: center;
    padding: 6px;
  }

  ${DevelopmentItems} {
    width: 100%;
    margin-left: 0;
  }

  ${SidebarFooter} {
    justify-content: center;
    padding: 8px 4px;
  }
`;

const Sidebar = styled.aside<{ $compact: boolean }>`
  position: fixed;
  z-index: 20;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  width: ${({ $compact }) => ($compact ? '41px' : '220px')};
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.background};
  transition: width ${theme.transition.smoothEaseOut};

  ${({ $compact }) => $compact && compactSidebar}
`;

const MainColumn = styled.section`
  display: flex;
  grid-column: 2;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  flex: 0 0 100px;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: ${theme.color.neutral.background};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 32px;
`;

const TitleGroup = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 2px;
`;

const ActorIdentity = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
`;

const ActorNameGroup = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
`;

const ActorAvatarFrame = styled.div`
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  overflow: hidden;
  padding: 2px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 8px;
`;

const ActorTitle = styled.h1`
  overflow: hidden;
  max-width: min(44vw, 520px);
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 20px;
  font-weight: 650;
  line-height: 24px;
  text-overflow: ellipsis;
  text-wrap: balance;
  white-space: nowrap;
`;

const HeaderActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  /* Lines the first meta item up with the first item of the nav row below (page gutter),
     whether that first item is the mode switcher or the Protected Actor tag. */
  padding-left: 8px;
`;

const TrailingLabeledModeControl = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
`;

const ModeControlLabel = styled.span`
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`;

const ActorInfoButton = styled(Button)`
  margin-left: auto;
`;

const TechnicalTag = styled(Tag)`
  font-family: var(--font-mono), monospace;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${theme.color.neutral.border};
`;

const Author = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  a {
    color: ${theme.color.primary.textInteractive};
    text-decoration: none;
  }
`;

const TabsBar = styled.div<{ $compact?: boolean }>`
  container-name: actor-tabs;
  container-type: inline-size;
  display: flex;
  flex: 0 0 ${({ $compact }) => ($compact ? '40px' : '56px')};
  height: ${({ $compact }) => ($compact ? '40px' : '56px')};
  align-items: center;
  gap: 4px;
  padding: ${({ $compact }) => ($compact ? '0 24px' : '7px 24px')};
  border-top: 1px solid ${theme.color.neutral.separatorSubtle};
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.backgroundMuted};
`;

const SeparatedTabsBar = styled(TabsBar)`
  gap: 0;
  padding: 0;
`;

const SeparatedModePane = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-self: stretch;
  align-items: center;
  padding: 7px 16px 7px 24px;
  border-right: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.backgroundMuted};
`;

const SeparatedTabsPane = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  align-self: stretch;
  align-items: center;
  gap: 4px;
  padding: 7px 16px;
`;

const Segmented = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  height: ${({ $compact }) => ($compact ? '28px' : '32px')};
  padding: ${({ $compact }) => ($compact ? '2px' : '0 3px')};
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  cursor: pointer;

  > span {
    display: inline-flex;
    cursor: inherit;
  }
`;

const Segment = styled.button<{ $active?: boolean; $disabled?: boolean; $compact?: boolean }>`
  position: relative;
  height: ${({ $compact }) => ($compact ? '22px' : '26px')};
  padding: ${({ $compact }) => ($compact ? '1px 6px' : '3px 8px')};
  border: ${({ $active }) => ($active ? `1px solid ${theme.color.neutral.border}` : '1px solid transparent')};
  border-radius: 4px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  color: ${({ $active, $disabled }) => ($disabled
    ? theme.color.neutral.textDisabled
    : $active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &::after {
    position: absolute;
    inset: -7px 0;
    content: '';
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }
`;

const DedicatedModeTabs = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;

  > span {
    display: inline-flex;
  }
`;

const DedicatedModeTab = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  position: relative;
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: ${({ $active }) => ($active ? `1px solid ${theme.color.neutral.border}` : '1px solid transparent')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  color: ${({ $active, $disabled }) => ($disabled
    ? theme.color.neutral.textDisabled
    : $active ? theme.color.neutral.text : theme.color.neutral.textMuted)};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};

  &::after {
    position: absolute;
    inset: -4px 0;
    content: '';
  }

  &:hover {
    background: ${({ $active, $disabled }) => ($disabled
      ? $active ? theme.color.neutral.background : 'transparent'
      : $active ? theme.color.neutral.background : theme.color.neutral.hover)};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }

  svg {
    flex: 0 0 16px;
    color: ${({ $disabled }) => ($disabled ? theme.color.neutral.iconDisabled : 'currentcolor')};
  }

  * {
    cursor: inherit;
  }
`;

const ModeDropdownTab = styled.div<{ $active: boolean }>`
  display: inline-flex;
  flex: 0 0 auto;
  height: 32px;
  align-items: center;

  > button {
    width: auto;
    min-width: 0;
    justify-content: flex-start;
    padding: 0 8px;
    border-color: ${({ $active }) => ($active ? theme.color.neutral.border : 'transparent')};
    border-radius: 6px;
    background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
    color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    cursor: pointer;

    &:hover {
      border-color: ${({ $active }) => ($active ? theme.color.neutral.border : 'transparent')};
      background: ${({ $active }) => ($active ? theme.color.neutral.background : theme.color.neutral.hover)};
    }

    * {
      cursor: inherit;
    }
  }
`;

const ModeDropdownLabel = styled.span`
  display: inline-flex;
  width: auto;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
`;

const tabsEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModeTabs = styled(Tabs)<{ $stagger?: boolean; $right?: boolean }>`
  min-width: 0;
  width: ${({ $right }) => ($right ? 'auto' : '100%')};
  flex: ${({ $right }) => ($right ? '0 0 auto' : '1')};
  height: 40px;

  [role='tablist'] {
    align-items: center;
    justify-content: ${({ $right }) => ($right ? 'flex-end' : 'flex-start')};
  }

  [role='tab'],
  [role='tab'] * {
    cursor: pointer;
  }

  ${({ $stagger }) =>
    $stagger &&
    css`
      [role='tab'] {
        opacity: 0;
        animation: ${tabsEnter} 260ms cubic-bezier(0.2, 0, 0, 1) forwards;
      }

      [role='tab']:nth-child(2) {
        animation-delay: 48ms;
      }

      [role='tab']:nth-child(3) {
        animation-delay: 96ms;
      }

      [role='tab']:nth-child(4) {
        animation-delay: 144ms;
      }

      [role='tab']:nth-child(5) {
        animation-delay: 192ms;
      }

      [role='tab']:nth-child(6) {
        animation-delay: 240ms;
      }

      [role='tab']:nth-child(7) {
        animation-delay: 288ms;
      }

      [role='tab']:nth-child(8) {
        animation-delay: 336ms;
      }

      @media (prefers-reduced-motion: reduce) {
        [role='tab'] {
          opacity: 1;
          animation: none;
          transform: none;
        }
      }
    `}
`;

const AdaptiveTabsSlot = styled.div<{ $reserveEndGap: boolean }>`
  min-width: 0;
  flex: 1;
  margin-right: ${({ $reserveEndGap }) => ($reserveEndGap ? '116px' : '0')};
`;

const MoreDropdownTab = styled(ModeDropdownTab)<{
  $stagger?: boolean;
  $staggerIndex?: number;
}>`
  flex: 0 0 auto;

  > button {
    color: ${theme.color.neutral.textMuted};
  }

  ${({ $stagger, $staggerIndex = 0 }) =>
    $stagger &&
    css`
      opacity: 0;
      animation: ${tabsEnter} 260ms cubic-bezier(0.2, 0, 0, 1) forwards;
      animation-delay: ${$staggerIndex * 48}ms;

      @media (prefers-reduced-motion: reduce) {
        opacity: 1;
        animation: none;
        transform: none;
      }
    `}
`;

const OverflowVisibleTabs = styled(ModeTabs)`
  width: auto;
  flex: 0 0 auto;
`;

const OperationalTabsTarget = styled.div`
  display: flex;
  width: fit-content;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
`;

const Content = styled.div<{ $detached?: boolean }>`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: ${({ $detached }) => ($detached ? '16px 24px 24px' : '24px')};
  background: ${theme.color.neutral.background};
`;

const ContentStack = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 16px;
`;

const DetachedModeRow = styled.div`
  display: flex;
  flex: 0 0 32px;
  align-items: center;
`;

const SurfaceCard = styled.section<{ $height: number }>`
  display: flex;
  flex: 0 0 ${({ $height }) => $height}px;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  padding: 2px;
  border-radius: 12px;
  background: ${theme.color.neutral.backgroundSubtle};
`;

const CardCaption = styled.h2`
  display: flex;
  align-items: center;
  height: 28px;
  margin: 0;
  padding: 4px 8px;
  border-radius: 12px 12px 0 0;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`;

const CardBody = styled.div`
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border-radius: 11px;
  background: ${theme.color.neutral.background};
`;

const SetupBody = styled(CardBody)`
  padding: 20px 24px 22px;
`;

const Description = styled.p`
  width: 558px;
  max-width: 70%;
  margin: 0 0 16px;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-wrap: pretty;
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: 280px minmax(300px, 1fr);
  gap: 40px;
  align-items: end;
`;

const TokenField = styled.div`
  display: grid;
  grid-template-columns: 240px 32px;
  align-items: end;
  gap: 8px;
`;

const Field = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`;

const ApiSelect = styled(SelectPrimitive)`
  width: 240px;

  .standby-select__control {
    min-height: 32px !important;
    height: 32px !important;
    padding: 0 4px;
  }

  .standby-select__value-container {
    height: 30px;
    padding: 0 6px;
  }

  .standby-select__single-value,
  .standby-select__input-container {
    margin: 0;
    padding: 0;
    font-size: 14px;
    line-height: 20px;
  }
`;

const EndpointFields = styled.div`
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(260px, 1fr) 85px;
  gap: 8px;
`;

const ReadonlyInput = styled.div`
  display: flex;
  min-width: 0;
  height: 32px;
  align-items: center;
  overflow: hidden;
  padding: 6px 12px;
  border: 1px solid ${theme.color.neutral.fieldBorder};
  border-radius: 6px;
  background: ${theme.color.neutral.fieldBackground};
  color: ${theme.color.neutral.text};
  font-size: 14px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SplitButton = styled.button`
  display: flex;
  height: 32px;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.text};
  cursor: pointer;

  span {
    display: grid;
    place-items: center;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  svg {
    box-sizing: content-box;
    padding: 7px;
    border-left: 1px solid ${theme.color.neutral.border};
  }
`;

const TestBody = styled(CardBody)`
  position: relative;
  padding: 16px;
`;

const AccordionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EndpointAccordion = styled.div`
  position: relative;
  display: flex;
  height: 196px;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${theme.color.neutral.separatorSubtle};
  border-radius: 12px;
  background: ${theme.color.neutral.background};
`;

const AccordionHeader = styled.button`
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 0 8px;
  border: 0;
  background: transparent;
  color: ${theme.color.neutral.text};
  cursor: pointer;
`;

const AccordionTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
`;

const Separator = styled.div`
  width: 66%;
  height: 1px;
  margin: 0 auto;
  border-radius: 8px;
  background: ${theme.color.neutral.separatorSubtle};
`;

const AccordionSpace = styled.div`
  flex: 1;
`;

const PlaceholderPanel = styled.section`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed ${theme.color.neutral.separatorSubtle};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  text-align: center;
`;

const PlaceholderMode = styled.span`
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const PlaceholderTitle = styled.h2`
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
  text-wrap: balance;
`;

const PlaceholderRoute = styled.code`
  display: inline-flex;
  height: 24px;
  align-items: center;
  padding: 0 8px;
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundSubtle};
  color: ${theme.color.neutral.textMuted};
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  line-height: 16px;
`;

const PlaceholderHint = styled.p`
  max-width: 360px;
  margin: 4px 0 0;
  color: ${theme.color.neutral.textMuted};
  font-size: 13px;
  line-height: 20px;
  text-wrap: pretty;
`;

const VariantDock = styled.aside`
  position: fixed;
  left: 50%;
  bottom: 16px;
  z-index: 20;
  display: flex;
  width: max-content;
  max-width: calc(100vw - 32px);
  align-items: center;
  gap: 3px;
  height: 48px;
  padding: 4px;
  border: 1px solid ${theme.color.primaryBlack.action};
  border-radius: 12px;
  background: ${theme.color.primaryBlack.background};
  transform: translateX(-50%);
`;

const DockVariantBadge = styled(Badge)`
  ${cssColorsVariablesDark}
  min-width: 20px;
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
`;

const MenuVariantBadge = styled(Badge)`
  min-width: 20px;
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
  transform: translateY(-2px);
`;

const VariantDropdownLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const VariantDropdownText = styled.span`
  width: 104px;
  text-align: left;
`;

const DockDivider = styled.span`
  width: 1px;
  height: 24px;
  flex: 0 0 1px;
  margin: 0 3px;
  background: color-mix(in srgb, ${theme.color.neutral.textOnPrimary} 18%, transparent);
`;

const ViewCheckboxLabel = styled.label`
  display: inline-flex;
  flex: 0 0 auto;
  height: 40px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: ${theme.color.neutral.textOnPrimary};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  cursor: pointer;
  transition-property: background-color;
  transition-duration: 120ms;
  transition-timing-function: ease;

  &:hover {
    background: ${theme.color.primaryBlack.backgroundHover};
  }

  &:focus-within {
    background: ${theme.color.primaryBlack.backgroundHover};
  }
`;

const ViewCheckbox = styled(CheckboxPrimitive)`
  ${cssColorsVariablesDark}
  flex: 0 0 auto;
  border-color: ${theme.color.neutral.border};
  background-color: ${theme.color.neutral.background};
`;

const TenancyDropdownLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const FlowPopoverCard = styled.aside<{ $arrowLeft: number; $placement: 'top' | 'bottom' }>`
  position: fixed;
  z-index: 50;
  width: 320px;
  padding: 16px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 8px;
  background: ${theme.color.neutral.background};
  box-shadow: ${theme.shadow.shadow2};

  &::before {
    position: absolute;
    left: ${({ $arrowLeft }) => `${$arrowLeft}px`};
    width: 10px;
    height: 10px;
    border-top: ${({ $placement }) => ($placement === 'bottom' ? `1px solid ${theme.color.neutral.border}` : '0')};
    border-left: ${({ $placement }) => ($placement === 'bottom' ? `1px solid ${theme.color.neutral.border}` : '0')};
    border-right: ${({ $placement }) => ($placement === 'top' ? `1px solid ${theme.color.neutral.border}` : '0')};
    border-bottom: ${({ $placement }) => ($placement === 'top' ? `1px solid ${theme.color.neutral.border}` : '0')};
    background: ${theme.color.neutral.background};
    content: '';
    transform: translateX(-50%) rotate(45deg);
    ${({ $placement }) => ($placement === 'bottom' ? 'top: -6px;' : 'bottom: -6px;')}
  }
`;

const FlowPopoverHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const FlowPopoverEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
  color: ${theme.color.primary.text};
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const FlowPopoverTitle = styled.h2`
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
`;

const FlowPopoverClose = styled.button`
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: ${theme.color.neutral.icon};
  cursor: pointer;

  &:hover {
    background: ${theme.color.neutral.hover};
  }
`;

const FlowPopoverBody = styled.p`
  margin: 8px 0 16px;
  color: ${theme.color.neutral.textSubtle};
  font-size: 13px;
  line-height: 20px;
  text-wrap: pretty;
`;

const FlowPopoverFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const FlowPopoverActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FlowStep = styled.span`
  color: ${theme.color.neutral.textMuted};
  font-size: 11px;
  line-height: 16px;
`;

// The tooltip content wrapper is a flex container, so a bare inline <a> becomes a flex
// item and breaks onto its own line. Keeping the copy in one span makes it a single flex
// item, and the text + link flow inline inside it again.
const TooltipCopy = styled.span`
  display: block;
`;

const TooltipDocsLink = styled.a`
  && {
    display: inline;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
  }
`;

const Execute = styled(Button)`
  position: absolute;
  top: 12px;
  right: 10px;
`;

const sidebarTopItems = [
  { label: 'Apify Store', Icon: ShoppingBagIcon },
  { label: 'Home', Icon: HomeIcon },
  { label: 'Actors', Icon: CodeIcon, selected: true },
  { label: 'Runs', Icon: PlayIcon },
  { label: 'Saved tasks', Icon: TasksIcon },
  { label: 'Integrations', Icon: PuzzleIcon },
  { label: 'Schedules', Icon: ClockIcon },
] as const;

const sidebarBottomItems = [
  { label: 'Proxy', Icon: GlobeIcon },
  { label: 'Storage', Icon: StorageIcon },
  { label: 'Billing', Icon: CreditCardIcon },
  { label: 'Settings', Icon: SettingsIcon },
] as const;

const sidebarDevelopmentItems = [
  { label: 'My Actors', Icon: DevelopmentIcon },
  { label: 'Insights', Icon: FilterIcon },
  { label: 'Messaging', Icon: CommentIcon },
] as const;

const runTabs: TabData[] = [
  { id: 'actor-input', title: 'Input', Icon: InputIcon, to: '#input' },
  { id: 'runs', title: 'Runs', Icon: PlayIcon, to: '#runs' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'integrations', title: 'Integrations', Icon: PuzzleIcon, to: '#integrations' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const runTabById = new Map(runTabs.map((tab) => [tab.id, tab]));

// The "Disabled" variant merges both modes into one tab bar. Tabs that Run mode can
// reach stay enabled there even when Multi-tenant Server mode would disable them —
// they are only unreachable on a server-only Actor.
const runModeRestorableTabIds = new Set(['runs', 'builds', 'integrations', 'tasks']);

const runModeRestoresTabs = (variant: NavigationVariant, supportsRunMode: boolean) => (
  variant === 'disabled' && supportsRunMode
);

const createDisabledTab = (tab: TabData, ariaLabel: string): TabData => ({
  ...tab,
  disabled: true,
  'aria-disabled': true,
  'aria-label': ariaLabel,
  tabIndex: -1,
} as TabData);

const requestsTab: TabData = {
  id: 'requests',
  title: 'Requests',
  Icon: PlayIcon,
  to: '#requests',
};

const mcpTab: TabData = {
  id: 'mcp',
  title: 'MCP',
  Icon: McpIcon,
  to: '#mcp',
};

const singleTenantRequestsTab = createDisabledTab(
  requestsTab,
  'Requests are unavailable in Single-tenant Server mode',
);

const multiTenantRunsTab = createDisabledTab(
  { id: 'runs', title: 'Runs', Icon: PlayIcon, to: '#runs' },
  'Runs are unavailable in Multi-tenant Server mode',
);

const integrationsTab: TabData = {
  id: 'integrations',
  title: 'Integrations',
  Icon: PuzzleIcon,
  to: '#integrations',
};

const multiTenantIntegrationsTab = createDisabledTab(
  integrationsTab,
  'Integrations are unavailable in Multi-tenant Server mode',
);

const singleTenantServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Server', Icon: ApiIcon, to: '#endpoints' },
  singleTenantRequestsTab,
  { id: 'runs', title: 'Runs', Icon: PlayIcon, to: '#runs' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'integrations', title: 'Integrations', Icon: PuzzleIcon, to: '#integrations' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const createDisabledMultiTenantTab = (tab: TabData): TabData => createDisabledTab(
  tab,
  `${tab.title} requires Dev mode in Multi-tenant Server mode`,
);

const multiTenantDevServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Server', Icon: ApiIcon, to: '#endpoints' },
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  multiTenantRunsTab,
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  multiTenantIntegrationsTab,
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const multiTenantServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Server', Icon: ApiIcon, to: '#endpoints' },
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  multiTenantRunsTab,
  createDisabledMultiTenantTab({ id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' }),
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  multiTenantIntegrationsTab,
  createDisabledMultiTenantTab({ id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' }),
];

const detachedUseTab: TabData = {
  id: 'use',
  title: 'Use',
  Icon: PlayIcon,
  to: '#use',
};

const developerTabs: TabData[] = [
  { id: 'source', title: 'Source', Icon: CodeIcon, to: '#source' },
  { id: 'publishing', title: 'Publishing', Icon: GlobeIcon, to: '#publishing' },
  { id: 'settings', title: 'Settings', Icon: SettingsIcon, to: '#settings' },
];

const inlineSourceTab = developerTabs.filter(({ id }) => id === 'source');
const developerUtilityTabs = developerTabs.filter(({ id }) => id !== 'source');

const developerTabIds = new Set(developerTabs.map(({ id }) => id));

const runModeMessage =
  'Run mode uses Apify Input to configure and start Actor runs.';
const serverModeMessage =
  'Server mode keeps the Actor ready to serve requests.';
const runModeUnsupportedMessage =
  `This Actor doesn’t support Run mode. ${runModeMessage}`;
const serverModeUnsupportedMessage =
  `This Actor doesn’t support Server mode. ${serverModeMessage}`;

const modeDocsUrls: Record<Mode, string> = {
  run: 'https://docs.apify.com/platform/actors/running',
  server: 'https://docs.apify.com/platform/actors/running/standby',
};

const modeDocsLabels: Record<Mode, string> = {
  run: 'Run mode',
  server: 'Server mode',
};

// Links the mode name inside the tooltip copy rather than appending a "Learn more".
const withDocsLink = (text: string, mode: Mode) => {
  const label = modeDocsLabels[mode];
  const index = text.indexOf(label);

  if (index === -1) return text;

  return (
    <TooltipCopy>
      {text.slice(0, index)}
      <TooltipDocsLink href={modeDocsUrls[mode]} target="_blank" rel="noreferrer">
        {label}
      </TooltipDocsLink>
      {text.slice(index + label.length)}
    </TooltipCopy>
  );
};

const variantOptions: Array<{
  id: NavigationVariant;
  number: number;
  label: string;
  shortLabel?: string;
}> = [
  {
    id: 'detached-above-labeled',
    number: 1,
    label: 'Detached above compact',
    shortLabel: 'Compact server',
  },
  { id: 'inline-separated', number: 2, label: 'Inline separated' },
  { id: 'disabled', number: 3, label: 'Disabled' },
];

const tabTitles: Record<string, string> = {
  run: 'Run mode',
  server: 'Server mode',
  input: 'Run mode',
  'actor-input': 'Input',
  runs: 'Runs',
  endpoints: 'Server',
  requests: 'Requests',
  mcp: 'MCP',
  builds: 'Builds',
  monitoring: 'Monitoring',
  integrations: 'Integrations',
  tasks: 'Saved tasks',
  use: 'Use',
  standby: 'Server mode',
  source: 'Source',
  publishing: 'Publishing',
  settings: 'Settings',
};

const tabRoutes: Record<string, string> = {
  run: 'runs',
  server: 'standby',
  input: 'input',
  'actor-input': 'input',
  mcp: 'mcp',
  source: 'source',
  publishing: 'publishing',
  settings: 'settings',
};

function getDefaultTab(variant: NavigationVariant, mode: Mode, splitMode: SplitMode): string {
  if (variant === 'detached') return 'use';
  if (variant === 'split') return splitMode === 'input' ? 'actor-input' : 'endpoints';
  return mode === 'run' ? 'actor-input' : 'endpoints';
}

const isDetachedAboveVariant = (variant: NavigationVariant) => (
  variant === 'detached-above'
  || variant === 'detached-above-labeled'
  || variant === 'detached-above-trailing-label'
);

const isInlineVariant = (variant: NavigationVariant) => (
  variant === 'inline'
  || variant === 'inline-v2'
  || variant === 'inline-separated'
  || isDetachedAboveVariant(variant)
);

const isDetachedVariant = (variant: NavigationVariant) => (
  variant === 'detached'
);

function SidebarItem({
  label,
  Icon,
  selected = false,
  compact = false,
}: {
  label: string;
  Icon: IconComponent;
  selected?: boolean;
  compact?: boolean;
}) {
  return (
    <NavItem
      type="button"
      $selected={selected}
      aria-label={label}
      title={compact ? label : undefined}
    >
      <Icon size="16" aria-hidden="true" />
      <NavItemLabel>{label}</NavItemLabel>
    </NavItem>
  );
}

function AppSidebar({ compact, onToggle }: { compact: boolean; onToggle: () => void }) {
  const [developmentExpanded, setDevelopmentExpanded] = useState(true);

  return (
    <Sidebar $compact={compact} aria-label="Apify Console navigation">
      <SidebarTop>
        <Account
          type="button"
          aria-label="Caroline Yooni Huh, Personal account"
          title={compact ? 'Caroline Yooni Huh' : undefined}
        >
          <UserAvatar name="Caroline Yooni Huh" url="/assets/profile.jpeg" size={32} />
          <AccountCopy>
            <AccountName>Caroline Yooni Huh</AccountName>
            <AccountPlan>Personal</AccountPlan>
          </AccountCopy>
          <ChevronDownIcon className="nav-disclosure" size="16" aria-hidden="true" />
        </Account>

        <SidebarSearchRow>
          <SearchBox type="button" aria-label="Search" title={compact ? 'Search' : undefined}>
            <SearchIcon size="16" aria-hidden="true" />
            <SearchLabel>Search..</SearchLabel>
            <Shortcut>⌘⇧K</Shortcut>
          </SearchBox>
          <NotificationButton type="button" title="Notifications" aria-label="Notifications">
            <BellIcon size="16" aria-hidden="true" />
          </NotificationButton>
        </SidebarSearchRow>
      </SidebarTop>

      <NavDivider />

      <SidebarNav>
        <NavSection>
          {sidebarTopItems.map((item) => (
            <SidebarItem key={item.label} compact={compact} {...item} />
          ))}
          <DevelopmentGroup>
            <SectionLabel
              type="button"
              aria-label="Development"
              aria-expanded={developmentExpanded}
              title={compact ? 'Development' : undefined}
              onClick={() => setDevelopmentExpanded((expanded) => !expanded)}
            >
              <span>Development</span>
              <ChevronDownIcon className="nav-disclosure" size="16" aria-hidden="true" />
            </SectionLabel>
            {developmentExpanded && (
              <DevelopmentItems>
                {sidebarDevelopmentItems.map((item) => (
                  <SidebarItem key={item.label} compact={compact} {...item} />
                ))}
              </DevelopmentItems>
            )}
          </DevelopmentGroup>
        </NavSection>
        <NavSpacer />
        <NavSection $bottom>
          {sidebarBottomItems.map((item) => (
            <SidebarItem key={item.label} compact={compact} {...item} />
          ))}
        </NavSection>
      </SidebarNav>

      <UsageBox>
        <UsageLine>
          <span>RAM</span>
          <span><strong>0 MB</strong> / 8GB</span>
        </UsageLine>
        <UsageLine>
          <span>Usage</span>
          <span><strong>$2.6k</strong> / $10k</span>
        </UsageLine>
      </UsageBox>

      <SidebarFooter>
        <ApifyLogo src="/assets/apify-logo.svg" alt="Apify" />
        <FooterActions>
          <IconButton
            aria-label="Help and resources"
            Icon={QuestionMarkIcon}
            size="extraSmall"
            variant={ICON_BUTTON_VARIANTS.BORDERED}
          />
          <IconButton
            aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            title={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            Icon={compact ? ExpandIcon : LayoutSidebarIcon}
            size="extraSmall"
            variant={ICON_BUTTON_VARIANTS.BORDERED}
            onClick={onToggle}
          />
        </FooterActions>
      </SidebarFooter>
    </Sidebar>
  );
}

function ActorHeader({
  onOpenActorInfo,
  modeControl,
}: {
  onOpenActorInfo: () => void;
  modeControl?: ReactNode;
}) {
  return (
    <Header>
      <TitleRow>
        <TitleGroup>
          <IconButton
            aria-label="View Actor info"
            title="View Actor info"
            Icon={ArrowLeftIcon}
            size="small"
            onClick={onOpenActorInfo}
          />
          <ActorIdentity>
            <ActorNameGroup>
              <ActorAvatarFrame>
                <ActorAvatar name="Contact Details Scraper" url="/assets/actor.png" size={18} borderRadius={5} />
              </ActorAvatarFrame>
              <ActorTitle>Contact Details Scraper Standby</ActorTitle>
            </ActorNameGroup>
            <IconButton aria-label="Edit Actor" Icon={EditIcon} size="small" />
            <Badge size="small" variant="primary_blue">Pay per event + usage</Badge>
          </ActorIdentity>
        </TitleGroup>
        <HeaderActions>
          <IconButton
            aria-label="More actions"
            Icon={MoreIcon}
            size="medium"
            variant={ICON_BUTTON_VARIANTS.BORDERED}
          />
          <Button size="medium" variant="secondary" RightIcon={ChevronDownIcon} onClick={() => undefined}>
            API
          </Button>
          <Button size="medium" disabled onClick={() => undefined}>Start</Button>
        </HeaderActions>
      </TitleRow>

      <MetaRow>
        {modeControl}
        {modeControl && <Dot aria-hidden="true" />}
        <Tag aria-label="Protected Actor" size="regular" variant="success" LeadingIcon={ShieldIcon} />
        <TechnicalTag
          size="regular"
          variant="subtle"
          TrailingIcon={CopyIcon}
          onClick={() => undefined}
        >
          lukas.holona/my-actor-1
        </TechnicalTag>
        <Dot aria-hidden="true" />
        <Author>
          <span>Crafted by</span>
          <UserAvatar name="Lukas Holona" url="/assets/author.png" size={20} />
          <a href="#author" onClick={(event) => event.preventDefault()}>Lukas Holona</a>
        </Author>
        <ActorInfoButton
          size="small"
          variant="tertiary"
          RightIcon={ExternalLinkIcon}
          onClick={onOpenActorInfo}
        >
          View Actor info
        </ActorInfoButton>
      </MetaRow>
    </Header>
  );
}

function SegmentedModeControl({
  mode,
  setMode,
  labels,
  tooltips,
  disabledModes,
  compact = false,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  labels: { run: string; server: string };
  tooltips?: { run: string; server: string };
  disabledModes?: Partial<Record<Mode, boolean>>;
  compact?: boolean;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const nextMode = event.key === 'ArrowRight' || event.key === 'End'
      ? 'server'
      : event.key === 'ArrowLeft' || event.key === 'Home'
        ? 'run'
        : undefined;

    if (!nextMode || disabledModes?.[nextMode]) return;

    event.preventDefault();
    setMode(nextMode);
    const nextButton = event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelector<HTMLButtonElement>(`[data-mode="${nextMode}"]`);
    nextButton?.focus();
  };

  const renderSegment = (segmentMode: Mode) => {
    const disabled = disabledModes?.[segmentMode] ?? false;
    const tooltip = tooltips?.[segmentMode];
    const segment = (
      <Segment
        type="button"
        role="tab"
        data-mode={segmentMode}
        data-flow-target={segmentMode === 'server' ? 'server-mode' : undefined}
        aria-selected={mode === segmentMode}
        aria-disabled={disabled}
        aria-label={disabled && tooltip ? `${labels[segmentMode]}. ${tooltip}` : labels[segmentMode]}
        tabIndex={disabled ? -1 : mode === segmentMode ? 0 : -1}
        $active={mode === segmentMode}
        $disabled={disabled}
        $compact={compact}
        onClick={() => {
          if (!disabled) setMode(segmentMode);
        }}
        onKeyDown={handleKeyDown}
      >
        {labels[segmentMode]}
      </Segment>
    );

    return tooltip ? (
      <Tooltip
        content={withDocsLink(tooltip, segmentMode)}
        placement="bottom"
        delayShow={disabled ? 200 : 500}
        delayHide={300}
        showInPortal
      >
        {segment}
      </Tooltip>
    ) : segment;
  };

  return (
    <Segmented
      role="tablist"
      aria-label="Actor mode"
      data-flow-target="mode-switcher"
      $compact={compact}
    >
      {renderSegment('run')}
      {renderSegment('server')}
    </Segmented>
  );
}

function DedicatedModeControl({
  mode,
  setMode,
  supportsRunMode,
  supportsServerMode,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  supportsRunMode: boolean;
  supportsServerMode: boolean;
}) {
  const disabledModes: Record<Mode, boolean> = {
    run: !supportsRunMode,
    server: !supportsServerMode,
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const nextMode = event.key === 'ArrowRight' || event.key === 'End'
      ? 'server'
      : event.key === 'ArrowLeft' || event.key === 'Home'
        ? 'run'
        : undefined;

    if (!nextMode || disabledModes[nextMode]) return;

    event.preventDefault();
    setMode(nextMode);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelector<HTMLButtonElement>(`[data-mode="${nextMode}"]`)
      ?.focus();
  };

  const renderTab = (tabMode: Mode) => {
    const disabled = disabledModes[tabMode];
    const label = tabMode === 'run' ? 'Input' : 'Server';
    const tooltip = tabMode === 'run'
      ? supportsRunMode
        ? 'Input configures and starts the Actor in Run mode.'
        : runModeUnsupportedMessage
      : supportsServerMode
        ? 'Server mode serves requests from the Actor.'
        : serverModeUnsupportedMessage;
    const Icon = tabMode === 'run' ? InputIcon : ApiIcon;
    const tab = (
      <DedicatedModeTab
        type="button"
        role="tab"
        data-mode={tabMode}
        data-flow-target={tabMode === 'server' ? 'server-mode' : undefined}
        aria-selected={mode === tabMode}
        aria-disabled={disabled}
        aria-label={disabled ? `${label}. ${tooltip}` : label}
        tabIndex={disabled ? -1 : mode === tabMode ? 0 : -1}
        $active={mode === tabMode}
        $disabled={disabled}
        onClick={() => {
          if (!disabled) setMode(tabMode);
        }}
        onKeyDown={handleKeyDown}
      >
        <Icon size="16" aria-hidden="true" />
        <span>{label}</span>
      </DedicatedModeTab>
    );

    return (
      <Tooltip
        content={withDocsLink(tooltip, tabMode)}
        placement="bottom"
        delayShow={disabled ? 200 : 500}
        delayHide={300}
        showInPortal
      >
        {tab}
      </Tooltip>
    );
  };

  return (
    <DedicatedModeTabs role="tablist" aria-label="Actor mode" data-flow-target="mode-switcher">
      {renderTab('run')}
      {renderTab('server')}
    </DedicatedModeTabs>
  );
}

function OverflowTabs({
  tabs,
  activeTab,
  setActiveTab,
  stagger,
  staggerIndex,
}: {
  tabs: TabData[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stagger?: boolean;
  staggerIndex?: number;
}) {
  const activeOverflowTab = tabs.some(({ id }) => id === activeTab);

  return (
    <MoreDropdownTab
      $active={activeOverflowTab}
      $stagger={stagger}
      $staggerIndex={staggerIndex}
    >
      <DropdownButton
        buttonLabel={(
          <ModeDropdownLabel>
            <span>More</span>
            <ChevronDownIcon size="16" aria-hidden="true" />
          </ModeDropdownLabel>
        )}
        width="176px"
        buttonProps={{
          size: 'medium',
          variant: 'tertiary',
          role: 'tab',
          'aria-selected': activeOverflowTab,
          'aria-label': 'More Actor tabs',
        } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
        contentProps={{ side: 'bottom', align: 'end', sideOffset: 4 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.Icon;

          return (
            <Dropdown.Item
              key={tab.id}
              disabled={tab.disabled}
              selected={tab.id === activeTab}
              icon={Icon ? <Icon size="16" aria-hidden="true" /> : undefined}
              onSelect={() => setActiveTab(tab.id)}
            >
              {typeof tab.title === 'string' ? tab.title : tab.id}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </MoreDropdownTab>
  );
}

function AdaptiveOperationalTabs({
  tabs,
  activeTab,
  setActiveTab,
  onSelect,
  stagger,
  reserveEndGap,
}: {
  tabs: TabData[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelect: ({ id, event }: { id: string; event: React.MouseEvent }) => void;
  stagger?: boolean;
  reserveEndGap: boolean;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef<number | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [availableWidth, setAvailableWidth] = useState<number>();

  useLayoutEffect(() => {
    setVisibleCount(tabs.length);
  }, [reserveEndGap, tabs]);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const renderedTabs = tabsRef.current;

    if (
      slot
      && renderedTabs
      && renderedTabs.scrollWidth > slot.clientWidth
      && visibleCount > 0
    ) {
      setVisibleCount((count) => count - 1);
    }
  }, [availableWidth, tabs, visibleCount]);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const slotResizeObserver = new ResizeObserver(([entry]) => {
      setAvailableWidth(Math.floor(entry.contentRect.width));
    });
    slotResizeObserver.observe(slot);

    const container = slot.parentElement;
    const containerResizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const previousWidth = containerWidthRef.current;

      if (previousWidth === undefined || width > previousWidth) {
        setVisibleCount(tabs.length);
      }

      containerWidthRef.current = width;
    });
    if (container) containerResizeObserver.observe(container);

    return () => {
      slotResizeObserver.disconnect();
      containerResizeObserver.disconnect();
    };
  }, [tabs]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);

  return (
    <AdaptiveTabsSlot ref={slotRef} $reserveEndGap={reserveEndGap}>
      <OperationalTabsTarget ref={tabsRef} data-flow-target="operational-tabs">
        {visibleTabs.length > 0 && (
          <OverflowVisibleTabs
            $stagger={stagger}
            variant="buttoned"
            tabs={visibleTabs}
            activeTab={activeTab}
            onSelect={onSelect}
          />
        )}
        {overflowTabs.length > 0 && (
          <OverflowTabs
            tabs={overflowTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stagger={stagger}
            staggerIndex={visibleTabs.length}
          />
        )}
      </OperationalTabsTarget>
    </AdaptiveTabsSlot>
  );
}

function ModeNavigation({
  mode,
  setMode,
  variant,
  activeTab,
  setActiveTab,
  splitMode,
  setSplitMode,
  multiTenant,
  devMode,
  supportsRunMode,
  supportsServerMode,
  alwaysShowModes,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  variant: NavigationVariant;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;
  multiTenant: boolean;
  devMode: boolean;
  supportsRunMode: boolean;
  supportsServerMode: boolean;
  alwaysShowModes: boolean;
}) {
  const [staggerMode, setStaggerMode] = useState<Mode>();
  const [staggerSplitMode, setStaggerSplitMode] = useState<SplitMode>();
  const inlineVariant = isInlineVariant(variant);
  const inlineSourceEnabled = variant === 'inline-v2' && devMode;

  useEffect(() => {
    if (!isInlineVariant(variant)) setStaggerMode(undefined);
    if (variant !== 'split') setStaggerSplitMode(undefined);
  }, [variant]);

  const previousModeRef = useRef(mode);
  useEffect(() => {
    if (isDetachedAboveVariant(variant) && previousModeRef.current !== mode) {
      setStaggerMode(mode);
    }

    previousModeRef.current = mode;
  }, [mode, variant]);

  const selectMode = (nextMode: Mode) => {
    const landingTab = variant === 'inline-v2' && devMode
      ? 'source'
      : nextMode === 'run' ? 'actor-input' : 'endpoints';

    if (nextMode === mode) {
      setActiveTab(landingTab);
      return;
    }

    setStaggerMode(nextMode);
    setActiveTab(landingTab);
    setMode(nextMode);
  };

  const selectTab = ({ id, event }: { id: string; event: React.MouseEvent }) => {
    event.preventDefault();

    if (variant === 'disabled') {
      if (id === 'actor-input') setMode('run');
      if (id === 'endpoints' || id === 'mcp' || id === 'requests') setMode('server');
    }

    setActiveTab(id);
  };

  const selectSplitMode = (nextMode: SplitMode) => {
    if (nextMode === splitMode) {
      setActiveTab(nextMode === 'input' ? 'actor-input' : 'endpoints');
      return;
    }

    setStaggerSplitMode(nextMode);
    setSplitMode(nextMode);
    setActiveTab(nextMode === 'input' ? 'actor-input' : 'endpoints');
  };

  const serverTabs = multiTenant
    ? devMode ? multiTenantDevServerTabs : multiTenantServerTabs
    : singleTenantServerTabs;
  const visibleServerTabs = variant === 'detached-above-labeled'
    ? serverTabs.flatMap((tab) => (
        tab.id === 'endpoints'
          ? [{ ...tab, title: 'Endpoints' }, mcpTab]
          : [tab]
      ))
    : variant === 'inline-separated'
      ? serverTabs.flatMap((tab) => (
          tab.id === 'endpoints' ? [tab, mcpTab] : [tab]
        ))
    : serverTabs;

  const runOnly = supportsRunMode && !supportsServerMode;
  const renderTabs = (tabs: TabData[], key: string, stagger = false) => {
    return (
      <>
        {inlineSourceEnabled && (
          <OverflowVisibleTabs
            variant="buttoned"
            tabs={inlineSourceTab}
            activeTab={activeTab}
            onSelect={selectTab}
          />
        )}
        <AdaptiveOperationalTabs
          key={key}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelect={selectTab}
          stagger={stagger}
          reserveEndGap={devMode}
        />
        {devMode && (
          <ModeTabs
            $right
            data-flow-target="developer-tabs"
            variant="buttoned"
            tabs={inlineSourceEnabled ? developerUtilityTabs : developerTabs}
            activeTab={activeTab}
            onSelect={selectTab}
          />
        )}
      </>
    );
  };

  const modeTooltips = {
    run: supportsRunMode ? runModeMessage : runModeUnsupportedMessage,
    server: supportsServerMode ? serverModeMessage : serverModeUnsupportedMessage,
  };

  const inlineModeControl = (
    <SegmentedModeControl
      mode={mode}
      setMode={selectMode}
      labels={variant === 'inline-separated'
        ? { run: 'Run', server: 'Server' }
        : { run: 'Run mode', server: 'Server mode' }}
      tooltips={modeTooltips}
      disabledModes={{ run: !supportsRunMode, server: !supportsServerMode }}
    />
  );

  if (runOnly && variant !== 'disabled' && !alwaysShowModes) {
    return (
      <TabsBar>
        {renderTabs(runTabs, 'run-only')}
      </TabsBar>
    );
  }

  if (variant === 'detached') {
    const tabs = mode === 'run'
      ? [
          detachedUseTab,
          multiTenant ? requestsTab : singleTenantRequestsTab,
          ...runTabs.slice(1),
        ]
      : [detachedUseTab, ...serverTabs.slice(1)];

    return (
      <TabsBar>
        {renderTabs(tabs, `detached:${mode}:${multiTenant}:${devMode}`)}
      </TabsBar>
    );
  }

  if (isDetachedAboveVariant(variant)) {
    const tabs = mode === 'run' ? runTabs : visibleServerTabs;

    return (
      <TabsBar>
        {renderTabs(tabs, `${variant}:${mode}`, staggerMode === mode)}
      </TabsBar>
    );
  }

  if (variant === 'disabled') {
    const serverTabsWithMcp = serverTabs.flatMap((tab) => (
      tab.id === 'endpoints' ? [tab, mcpTab] : [tab]
    ));
    const runPrimarySource = runTabs.filter(({ id }) => id === 'actor-input');
    const serverPrimarySource = serverTabsWithMcp.filter(({ id }) => (
      id === 'endpoints' || id === 'mcp' || id === 'requests'
    ));
    // With "Always show modes" the mode-specific tabs stay in the bar and read as
    // disabled instead of disappearing when the Actor doesn't support that mode.
    const runPrimaryTabs = supportsRunMode
      ? runPrimarySource
      : alwaysShowModes
        ? runPrimarySource.map((tab) => createDisabledTab(
            tab,
            `${tab.title} requires Run mode, which this Actor doesn’t support`,
          ))
        : [];
    const serverPrimaryTabs = supportsServerMode
      ? serverPrimarySource
      : alwaysShowModes
        ? serverPrimarySource.map((tab) => createDisabledTab(
            tab,
            `${tab.title} requires Server mode, which this Actor doesn’t support`,
          ))
        : [];
    const restoreRunModeTabs = runModeRestoresTabs(variant, supportsRunMode);
    const sharedTabs = supportsServerMode
      ? serverTabs
        .filter(({ id }) => id !== 'endpoints' && id !== 'requests')
        .map((tab) => (
          restoreRunModeTabs && runModeRestorableTabIds.has(String(tab.id))
            ? runTabById.get(tab.id) ?? tab
            : tab
        ))
      : supportsRunMode
        ? runTabs.filter(({ id }) => id !== 'actor-input')
        : [];
    const tabs = [...runPrimaryTabs, ...serverPrimaryTabs, ...sharedTabs];

    return (
      <TabsBar>
        {renderTabs(
          tabs,
          `disabled:${supportsRunMode}:${supportsServerMode}:${alwaysShowModes}:${multiTenant}:${devMode}`,
        )}
      </TabsBar>
    );
  }

  const tabs = variant === 'split'
    ? splitMode === 'input' ? runTabs : visibleServerTabs
    : mode === 'run' ? runTabs : visibleServerTabs;

  if (variant === 'inline-separated') {
    return (
      <SeparatedTabsBar>
        <SeparatedModePane>{inlineModeControl}</SeparatedModePane>
        <SeparatedTabsPane>
          {renderTabs(tabs, mode, staggerMode === mode)}
        </SeparatedTabsPane>
      </SeparatedTabsBar>
    );
  }

  return (
    <TabsBar>
      {inlineVariant ? (
        inlineModeControl
      ) : (
        <ModeDropdownTab $active={activeTab === splitMode}>
          <DropdownButton
            buttonLabel={(
              <ModeDropdownLabel>
                <span>{splitMode === 'input' ? 'Run mode' : 'Server mode'}</span>
                <ChevronDownIcon size="16" aria-hidden="true" />
              </ModeDropdownLabel>
            )}
            width="128px"
            buttonProps={{
              size: 'medium',
              variant: 'tertiary',
              role: 'tab',
              'aria-selected': activeTab === splitMode,
              'aria-label': `${splitMode === 'input' ? 'Run mode' : 'Server mode'}, choose Actor mode`,
              'data-flow-target': 'server-mode',
              onClick: () => undefined,
            } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
            contentProps={{ side: 'bottom', align: 'start', sideOffset: 4 }}
          >
            <Dropdown.Item
              disabled={!supportsRunMode}
              selected={splitMode === 'input'}
              onSelect={() => selectSplitMode('input')}
            >
              Run mode
            </Dropdown.Item>
            <Dropdown.Item
              disabled={!supportsServerMode}
              selected={splitMode === 'server'}
              onSelect={() => selectSplitMode('server')}
            >
              Server mode
            </Dropdown.Item>
          </DropdownButton>
        </ModeDropdownTab>
      )}
      {renderTabs(
        tabs,
        inlineVariant ? mode : variant === 'split' ? splitMode : variant,
        (
          (inlineVariant && staggerMode === mode)
          || (variant === 'split' && staggerSplitMode === splitMode)
        ),
      )}
    </TabsBar>
  );
}

function PlaceholderContent({
  variant,
  mode,
  setMode,
  splitMode,
  activeTab,
  setActiveTab,
  supportsRunMode,
  supportsServerMode,
}: {
  variant: NavigationVariant;
  mode: Mode;
  setMode: (mode: Mode) => void;
  splitMode: SplitMode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  supportsRunMode: boolean;
  supportsServerMode: boolean;
}) {
  const detached = isDetachedVariant(variant);
  const modeLabel = variant === 'split'
    ? splitMode === 'input' ? 'Run mode' : 'Server mode'
    : detached
      ? mode === 'run' ? 'Run mode' : 'Server mode'
      : mode === 'run' ? 'Run mode' : 'Server mode';
  const tabTitle = activeTab === 'endpoints' && variant === 'detached-above-labeled'
    ? 'Endpoints'
    : tabTitles[activeTab] ?? 'Content';
  const tabRoute = tabRoutes[activeTab] ?? activeTab;

  const selectDetachedMode = (nextMode: Mode) => {
    setMode(nextMode);
    setActiveTab('use');
  };

  return (
    <Content $detached={detached}>
      <ContentStack>
        {variant === 'detached' && activeTab === 'use' && (
          <DetachedModeRow>
            <SegmentedModeControl
              mode={mode}
              setMode={selectDetachedMode}
              labels={{ run: 'Run mode', server: 'Server mode' }}
              tooltips={!supportsRunMode || !supportsServerMode ? {
                run: supportsRunMode ? runModeMessage : runModeUnsupportedMessage,
                server: supportsServerMode ? serverModeMessage : serverModeUnsupportedMessage,
              } : undefined}
              disabledModes={{ run: !supportsRunMode, server: !supportsServerMode }}
            />
          </DetachedModeRow>
        )}
        <PlaceholderPanel
          role="region"
          aria-label={`${modeLabel}: ${tabTitle} placeholder`}
          aria-live="polite"
        >
          <PlaceholderMode>{modeLabel}</PlaceholderMode>
          <PlaceholderTitle>{tabTitle} content</PlaceholderTitle>
          <PlaceholderRoute>/{tabRoute}</PlaceholderRoute>
          <PlaceholderHint>
            Placeholder for the content relevant to this mode and tab.
          </PlaceholderHint>
        </PlaceholderPanel>
      </ContentStack>
    </Content>
  );
}

function FlowOnboarding({
  flow,
  contextKey,
  onDismiss,
}: {
  flow?: OnboardingFlow;
  contextKey: string;
  onDismiss: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    placement: 'top' | 'bottom';
  }>();

  const steps = flow === 'reshuffle'
    ? [
      {
        target: 'mode-switcher',
        eyebrow: 'Navigation guide',
        title: 'Switch between modes',
        body: 'Use this segmented control to switch between Run mode and Server mode. Run mode starts Actor runs from Input, while Server mode keeps the Actor ready to serve requests.',
      },
      {
        target: 'operational-tabs',
        eyebrow: 'Navigation guide',
        title: 'Mode-specific tabs',
        body: 'The tabs on the left contain the workflows for the selected mode. They update when you switch between Run mode and Server mode.',
      },
      {
        target: 'developer-tabs',
        eyebrow: 'Navigation guide',
        title: 'Developer tools',
        body: 'Source, Publishing, and Settings stay grouped on the right when Developer view is enabled.',
      },
    ]
    : [
      {
        target: 'server-mode',
        eyebrow: 'New feature',
        title: 'Meet Server mode',
        body: 'Server mode keeps this Actor ready to receive HTTP requests. Use it when your integration needs an immediate response instead of starting a new run each time.',
      },
    ];
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  useEffect(() => {
    setStepIndex(0);
  }, [flow]);

  useEffect(() => {
    const clearHighlights = () => {
      document.querySelectorAll<HTMLElement>('[data-flow-highlight="true"]')
        .forEach((element) => element.removeAttribute('data-flow-highlight'));
    };

    clearHighlights();
    if (!flow) {
      setPosition(undefined);
      return;
    }

    const findTarget = () => {
      const candidates = [...document.querySelectorAll<HTMLElement>(`[data-flow-target="${step.target}"]`)];
      const visibleTarget = candidates.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (visibleTarget || candidates[0]) return visibleTarget ?? candidates[0];
      if (step.target === 'server-mode') {
        return [...document.querySelectorAll<HTMLElement>('[role="tab"]')].find((element) => {
          const rect = element.getBoundingClientRect();
          return element.textContent?.trim() === 'Server mode' && rect.width > 0 && rect.height > 0;
        });
      }

      return undefined;
    };

    let target = findTarget();
    let resizeObserver: ResizeObserver | undefined;

    const updatePosition = () => {
      target = findTarget();
      if (!target) return;

      clearHighlights();
      target.setAttribute('data-flow-highlight', 'true');

      const targetRect = target.getBoundingClientRect();
      const cardWidth = 320;
      const estimatedCardHeight = 210;
      const viewportPadding = 12;
      const gap = 12;
      const targetCenter = targetRect.left + targetRect.width / 2;
      const left = Math.max(
        viewportPadding,
        Math.min(window.innerWidth - cardWidth - viewportPadding, targetCenter - cardWidth / 2),
      );
      const fitsBelow = targetRect.bottom + gap + estimatedCardHeight <= window.innerHeight - viewportPadding;
      const placement = fitsBelow ? 'bottom' : 'top';
      const top = placement === 'bottom'
        ? targetRect.bottom + gap
        : targetRect.top - estimatedCardHeight - gap;

      setPosition({
        top,
        left,
        arrowLeft: Math.max(20, Math.min(cardWidth - 20, targetCenter - left)),
        placement,
      });
    };

    updatePosition();
    if (target) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(target);
    }

    const settleTimer = window.setTimeout(updatePosition, 320);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(settleTimer);
      resizeObserver?.disconnect();
      clearHighlights();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextKey, flow, onDismiss, step.target]);

  if (!flow || !position) return null;

  const finalStep = stepIndex === steps.length - 1;
  const titleId = `${flow}-flow-title`;

  return (
    <FlowPopoverCard
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      $arrowLeft={position.arrowLeft}
      $placement={position.placement}
      style={{ top: position.top, left: position.left }}
    >
      <FlowPopoverHeader>
        <div>
          <FlowPopoverEyebrow>
            <SparkleIcon size="12" aria-hidden="true" />
            {step.eyebrow}
          </FlowPopoverEyebrow>
          <FlowPopoverTitle id={titleId}>{step.title}</FlowPopoverTitle>
        </div>
        <FlowPopoverClose type="button" aria-label="Dismiss onboarding guide" onClick={onDismiss}>
          <CrossIcon size="16" aria-hidden="true" />
        </FlowPopoverClose>
      </FlowPopoverHeader>
      <FlowPopoverBody>{step.body}</FlowPopoverBody>
      <FlowPopoverFooter>
        <FlowStep>{stepIndex + 1} of {steps.length}</FlowStep>
        <FlowPopoverActions>
          {stepIndex > 0 && (
            <Button size="small" variant="tertiary" onClick={() => setStepIndex((index) => index - 1)}>
              Back
            </Button>
          )}
          <Button
            size="small"
            variant="primary"
            onClick={() => finalStep ? onDismiss() : setStepIndex((index) => index + 1)}
          >
            {finalStep ? 'Got it' : 'Next'}
          </Button>
        </FlowPopoverActions>
      </FlowPopoverFooter>
    </FlowPopoverCard>
  );
}

function DockCheckbox({
  id,
  label,
  value,
  setValue,
}: {
  id: string;
  label: string;
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  return (
    <ViewCheckboxLabel htmlFor={id}>
      <ViewCheckbox id={id} value={value} setValue={setValue} aria-label={label} />
      <span>{label}</span>
    </ViewCheckboxLabel>
  );
}

function VariantSelector({
  variant,
  onSelect,
  standbyFlowEnabled,
  setStandbyFlowEnabled,
  reshuffleFlowEnabled,
  setReshuffleFlowEnabled,
  multiTenant,
  setMultiTenant,
  devMode,
  setDevMode,
  supportsRunMode,
  setSupportsRunMode,
  supportsServerMode,
  setSupportsServerMode,
  alwaysShowModes,
  setAlwaysShowModes,
}: {
  variant: NavigationVariant;
  onSelect: (variant: NavigationVariant) => void;
  standbyFlowEnabled: boolean;
  setStandbyFlowEnabled: (enabled: boolean) => void;
  reshuffleFlowEnabled: boolean;
  setReshuffleFlowEnabled: (enabled: boolean) => void;
  multiTenant: boolean;
  setMultiTenant: (multiTenant: boolean) => void;
  devMode: boolean;
  setDevMode: (devMode: boolean) => void;
  supportsRunMode: boolean;
  setSupportsRunMode: (supported: boolean) => void;
  supportsServerMode: boolean;
  setSupportsServerMode: (supported: boolean) => void;
  alwaysShowModes: boolean;
  setAlwaysShowModes: (enabled: boolean) => void;
}) {
  const selectedVariant = variantOptions.find((option) => option.id === variant) ?? variantOptions[0];

  return (
    <VariantDock aria-label="Navigation design options">
      <DropdownButton
        buttonLabel={(
          <VariantDropdownLabel>
            <DockVariantBadge size="small" variant="neutral_muted">
              {selectedVariant.number}
            </DockVariantBadge>
            <VariantDropdownText>
              {selectedVariant.shortLabel ?? selectedVariant.label}
            </VariantDropdownText>
            <ChevronDownIcon size="16" aria-hidden="true" />
          </VariantDropdownLabel>
        )}
        width="232px"
        buttonProps={{
          size: 'extraLarge',
          variant: 'tertiary',
          color: 'primaryBlack',
          className: 'control-center-select',
          'aria-label': `Navigation variant: Option ${selectedVariant.number}, ${selectedVariant.label}`,
        } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
        contentProps={{
          side: 'top',
          align: 'start',
          sideOffset: 6,
          className: 'control-center-menu',
        }}
      >
        {variantOptions.map((option) => (
          <Dropdown.Item
            key={option.id}
            icon={(
              <MenuVariantBadge size="small" variant="neutral_muted">
                {option.number}
              </MenuVariantBadge>
            )}
            selected={option.id === variant}
            onSelect={() => onSelect(option.id)}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="supports-run-mode"
        label="Run support"
        value={supportsRunMode}
        setValue={setSupportsRunMode}
      />
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="supports-server-mode"
        label="Server support"
        value={supportsServerMode}
        setValue={setSupportsServerMode}
      />
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="always-show-modes"
        label="Always show modes"
        value={alwaysShowModes}
        setValue={setAlwaysShowModes}
      />
      <DockDivider aria-hidden="true" />
      <DropdownButton
        buttonLabel={(
          <TenancyDropdownLabel>
            <span>{multiTenant ? 'Multi-tenant' : 'Single-tenant'}</span>
            <ChevronDownIcon size="16" aria-hidden="true" />
          </TenancyDropdownLabel>
        )}
        width="128px"
        buttonProps={{
          size: 'extraLarge',
          variant: 'tertiary',
          color: 'primaryBlack',
          className: 'control-center-select',
          'aria-label': `Tenancy: ${multiTenant ? 'Multi-tenant' : 'Single-tenant'}`,
        } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
        contentProps={{
          side: 'top',
          align: 'end',
          sideOffset: 4,
          className: 'control-center-menu',
        }}
      >
        <Dropdown.Item selected={!multiTenant} onSelect={() => setMultiTenant(false)}>
          Single-tenant
        </Dropdown.Item>
        <Dropdown.Item selected={multiTenant} onSelect={() => setMultiTenant(true)}>
          Multi-tenant
        </Dropdown.Item>
      </DropdownButton>
      <DockDivider aria-hidden="true" />
      <DockCheckbox id="developer-view" label="Developer" value={devMode} setValue={setDevMode} />
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="standby-onboarding-flow"
        label="Standby flow"
        value={standbyFlowEnabled}
        setValue={setStandbyFlowEnabled}
      />
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="reshuffle-onboarding-flow"
        label="Reshuffle flow"
        value={reshuffleFlowEnabled}
        setValue={setReshuffleFlowEnabled}
      />
    </VariantDock>
  );
}

function PrototypeInner() {
  const [mode, setMode] = useState<Mode>('run');
  const [splitMode, setSplitMode] = useState<SplitMode>('input');
  const [variant, setVariant] = useState<NavigationVariant>('detached-above-labeled');
  const [activeTab, setActiveTab] = useState('actor-input');
  const [standbyFlowEnabled, setStandbyFlowEnabled] = useState(false);
  const [reshuffleFlowEnabled, setReshuffleFlowEnabled] = useState(false);
  const [multiTenant, setMultiTenant] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [supportsRunMode, setSupportsRunMode] = useState(true);
  const [supportsServerMode, setSupportsServerMode] = useState(true);
  const [alwaysShowModes, setAlwaysShowModes] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [currentView, setCurrentView] = useState<PrototypeView>('prototype');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const option = Number(searchParams.get('option'));
    const initialVariant = variantOptions.find((item) => item.number === option)?.id;

    if (initialVariant) {
      setVariant(initialVariant);
      setActiveTab(getDefaultTab(initialVariant, mode, splitMode));
    } else if (searchParams.has('option')) {
      const url = new URL(window.location.href);
      url.searchParams.set('option', '1');
      window.history.replaceState({}, '', url);
    }

    setCurrentView(searchParams.get('view') === 'actor-info' ? 'actor-info' : 'prototype');

    const syncViewFromHistory = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentView(params.get('view') === 'actor-info' ? 'actor-info' : 'prototype');
    };

    window.addEventListener('popstate', syncViewFromHistory);
    return () => window.removeEventListener('popstate', syncViewFromHistory);
  }, []);

  useEffect(() => {
    if (!standbyFlowEnabled) return;

    if (isInlineVariant(variant) || variant === 'disabled') {
      setMode('server');
      setActiveTab('endpoints');
    } else if (variant === 'split') {
      setSplitMode('server');
      setActiveTab('endpoints');
    } else if (isDetachedVariant(variant)) {
      setMode('server');
      setActiveTab('use');
    } else {
      setActiveTab('standby');
    }
  }, [standbyFlowEnabled, variant]);

  useEffect(() => {
    if (!reshuffleFlowEnabled) return;

    setVariant('detached-above-labeled');
    setSupportsRunMode(true);
    setSupportsServerMode(true);
    setMode('run');
    setSplitMode('input');
    setActiveTab('actor-input');
    setDevMode(true);

    const url = new URL(window.location.href);
    url.searchParams.set('option', '1');
    window.history.replaceState({}, '', url);
  }, [reshuffleFlowEnabled]);

  const selectVariant = (nextVariant: NavigationVariant) => {
    setVariant(nextVariant);
    setActiveTab(
      supportsRunMode && !supportsServerMode
        ? 'actor-input'
        : getDefaultTab(nextVariant, mode, splitMode),
    );

    const url = new URL(window.location.href);
    const option = variantOptions.find((item) => item.id === nextVariant);
    if (option) url.searchParams.set('option', String(option.number));
    window.history.replaceState({}, '', url);
  };

  const selectTenancy = (nextMultiTenant: boolean) => {
    const serverModeActive = (variant === 'disabled' && supportsServerMode)
      || (isInlineVariant(variant) && mode === 'server')
      || (variant === 'split' && splitMode === 'server')
      || (variant === 'detached' && mode === 'server');
    const restoreRunModeTabs = runModeRestoresTabs(variant, supportsRunMode);
    const requestsBecomesDisabled = !nextMultiTenant
      && activeTab === 'requests'
      && (serverModeActive || variant === 'detached');
    const runsBecomesDisabled = nextMultiTenant
      && activeTab === 'runs'
      && serverModeActive
      && !restoreRunModeTabs;
    const developerTabBecomesDisabled = nextMultiTenant
      && !devMode
      && serverModeActive
      && (activeTab === 'builds' || activeTab === 'tasks')
      && !restoreRunModeTabs;
    const integrationsBecomesDisabled = nextMultiTenant
      && activeTab === 'integrations'
      && serverModeActive
      && !restoreRunModeTabs;

    if (
      requestsBecomesDisabled
      || runsBecomesDisabled
      || developerTabBecomesDisabled
      || integrationsBecomesDisabled
    ) {
      setActiveTab(variant === 'detached' ? 'use' : 'endpoints');
      if (variant === 'disabled') setMode('server');
    }

    setMultiTenant(nextMultiTenant);
  };

  const selectDevMode = (nextDevMode: boolean) => {
    const serverModeActive = (variant === 'disabled' && supportsServerMode)
      || (isInlineVariant(variant) && mode === 'server')
      || (variant === 'split' && splitMode === 'server')
      || (variant === 'detached' && mode === 'server');

    if (!nextDevMode) {
      if (developerTabIds.has(activeTab)) {
        setActiveTab(
          supportsRunMode && !supportsServerMode
            ? 'actor-input'
            : getDefaultTab(variant, mode, splitMode),
        );
      } else if (
        multiTenant
        && serverModeActive
        && (activeTab === 'builds' || activeTab === 'tasks')
        && !runModeRestoresTabs(variant, supportsRunMode)
      ) {
        setActiveTab('endpoints');
        if (variant === 'disabled') setMode('server');
      }
    }

    setDevMode(nextDevMode);
  };

  const selectRunModeSupport = (supported: boolean) => {
    setSupportsRunMode(supported);

    if (supported) {
      if (!supportsServerMode) {
        setMode('run');
        setSplitMode('input');
        setActiveTab('actor-input');
      }
      return;
    }

    if (!supportsServerMode) return;

    setMode('server');
    setSplitMode('server');
    setActiveTab(isDetachedVariant(variant) ? 'use' : 'endpoints');
  };

  const selectServerModeSupport = (supported: boolean) => {
    setSupportsServerMode(supported);

    if (supported) {
      if (!supportsRunMode) {
        setMode('server');
        setSplitMode('server');
        setActiveTab(isDetachedVariant(variant) ? 'use' : 'endpoints');
      }
      return;
    }

    if (!supportsRunMode) return;

    setMode('run');
    setSplitMode('input');
    setActiveTab('actor-input');
  };

  const selectStandbyFlow = (enabled: boolean) => {
    setStandbyFlowEnabled(enabled);
    if (enabled) setReshuffleFlowEnabled(false);
  };

  const selectReshuffleFlow = (enabled: boolean) => {
    setReshuffleFlowEnabled(enabled);
    if (enabled) setStandbyFlowEnabled(false);
  };

  const dismissFlows = useCallback(() => {
    setStandbyFlowEnabled(false);
    setReshuffleFlowEnabled(false);
  }, []);

  const navigateToView = (nextView: PrototypeView) => {
    setCurrentView(nextView);
    dismissFlows();

    const url = new URL(window.location.href);
    if (nextView === 'actor-info') url.searchParams.set('view', 'actor-info');
    else url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };

  const headerModeSwitcher = isDetachedAboveVariant(variant) ? (
    <SegmentedModeControl
      mode={mode}
      setMode={(nextMode) => {
        setMode(nextMode);
        setActiveTab(nextMode === 'run' ? 'actor-input' : 'endpoints');
      }}
      labels={variant === 'detached-above-labeled'
        ? { run: 'Run', server: 'Server' }
        : variant === 'detached-above-trailing-label'
          ? { run: 'Run', server: 'Server' }
        : { run: 'Run mode', server: 'Server mode' }}
      tooltips={{
        run: supportsRunMode ? runModeMessage : runModeUnsupportedMessage,
        server: supportsServerMode ? serverModeMessage : serverModeUnsupportedMessage,
      }}
      disabledModes={{ run: !supportsRunMode, server: !supportsServerMode }}
      compact
    />
  ) : undefined;

  const headerModeControl = (
    headerModeSwitcher
    && (alwaysShowModes || !(supportsRunMode && !supportsServerMode))
  ) ? variant === 'detached-above-trailing-label' ? (
    <TrailingLabeledModeControl>
      {headerModeSwitcher}
      <ModeControlLabel>Mode</ModeControlLabel>
    </TrailingLabeledModeControl>
  ) : headerModeSwitcher : undefined;

  return (
    <Shell $sidebarCompact={sidebarCompact}>
      <AppSidebar compact={sidebarCompact} onToggle={() => setSidebarCompact((compact) => !compact)} />
      <MainColumn>
        {currentView === 'actor-info' ? (
          <ActorInfoView onBack={() => navigateToView('prototype')} />
        ) : (
          <>
            <ActorHeader
              onOpenActorInfo={() => navigateToView('actor-info')}
              modeControl={headerModeControl}
            />
            <ModeNavigation
              mode={mode}
              setMode={setMode}
              variant={variant}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              splitMode={splitMode}
              setSplitMode={setSplitMode}
              multiTenant={multiTenant}
              devMode={devMode}
              supportsRunMode={supportsRunMode}
              supportsServerMode={supportsServerMode}
              alwaysShowModes={alwaysShowModes}
            />
            <PlaceholderContent
              variant={variant}
              mode={mode}
              setMode={setMode}
              splitMode={splitMode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              supportsRunMode={supportsRunMode}
              supportsServerMode={supportsServerMode}
            />
          </>
        )}
      </MainColumn>
      {currentView === 'prototype' && (
        <>
          <FlowOnboarding
            flow={standbyFlowEnabled ? 'standby' : reshuffleFlowEnabled ? 'reshuffle' : undefined}
            contextKey={`${variant}:${mode}:${splitMode}:${activeTab}:${devMode}`}
            onDismiss={dismissFlows}
          />
          <VariantSelector
            variant={variant}
            onSelect={selectVariant}
            standbyFlowEnabled={standbyFlowEnabled}
            setStandbyFlowEnabled={selectStandbyFlow}
            reshuffleFlowEnabled={reshuffleFlowEnabled}
            setReshuffleFlowEnabled={selectReshuffleFlow}
            multiTenant={multiTenant}
            setMultiTenant={selectTenancy}
            devMode={devMode}
            setDevMode={selectDevMode}
            supportsRunMode={supportsRunMode}
            setSupportsRunMode={selectRunModeSupport}
            supportsServerMode={supportsServerMode}
            setSupportsServerMode={selectServerModeSupport}
            alwaysShowModes={alwaysShowModes}
            setAlwaysShowModes={setAlwaysShowModes}
          />
        </>
      )}
    </Shell>
  );
}

export function Prototype() {
  return (
    <UiDependencyProvider dependencies={dependencies}>
      <ApifyTokens />
      <PrototypeInner />
    </UiDependencyProvider>
  );
}
