'use client';

import type { ImgHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useEffect, useState } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

import {
  ApiIcon,
  ArrowLeftIcon,
  BellIcon,
  BuildsIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  CreditCardIcon,
  DatabaseIcon,
  EditIcon,
  GlobeIcon,
  HomeIcon,
  InputIcon,
  LayoutSidebarIcon,
  MonitoringIcon,
  MoreIcon,
  PlayIcon,
  PuzzleIcon,
  QuestionMarkIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StandbyIcon,
  StorageIcon,
  TasksIcon,
} from '@apify/ui-icons';
import type { IconComponent } from '@apify/ui-icons';
import {
  ActorAvatar,
  Badge,
  Button,
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

type Mode = 'run' | 'server';
type SplitMode = 'input' | 'server';
type NavigationVariant = 'inline' | 'split' | 'detached' | 'disabled';

const ApifyTokens = createGlobalStyle`
  :root {
    ${cssColorsVariablesLight}
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

const Shell = styled.main`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: 100vw;
  min-width: 1024px;
  height: 100vh;
  min-height: 640px;
  background: ${theme.color.neutral.background};
`;

const Sidebar = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 220px;
  height: 100%;
  border-right: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.background};
  overflow: hidden;
`;

const Account = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 8px 12px;
`;

const AccountCopy = styled.div`
  min-width: 0;
  flex: 1;
`;

const AccountName = styled.div`
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: ${theme.color.neutral.text};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AccountPlan = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${theme.color.neutral.textSubtle};
`;

const SidebarSearchRow = styled.div`
  display: flex;
  gap: 4px;
  height: 40px;
  padding: 4px 8px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  height: 32px;
  padding: 0 7px;
  gap: 6px;
  border: 1px solid ${theme.color.neutral.fieldBorder};
  border-radius: 6px;
  color: ${theme.color.neutral.icon};
  background: ${theme.color.neutral.background};

  span {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 16px;
    color: ${theme.color.neutral.textSubtle};
  }
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
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.text};
  cursor: pointer;

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
  padding: 4px 8px 12px;
`;

const NavCluster = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavSpacer = styled.div`
  flex: 1;
  min-height: 24px;
`;

const NavItem = styled.a<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  padding: 4px 8px;
  border-radius: 6px;
  color: ${theme.color.neutral.text};
  background: ${({ $selected }) => ($selected ? theme.color.neutral.backgroundSubtle : 'transparent')};
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  text-decoration: none;

  &:hover {
    background: ${theme.color.neutral.hover};
  }
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: ${theme.color.neutral.textSubtle};
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

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 8px 16px;
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

const MainColumn = styled.section`
  display: flex;
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
  padding-left: 26px;
`;

const TechnicalTag = styled(Tag)`
  font-family: var(--font-mono), monospace;
`;

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${theme.color.neutral.textSubtle};
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
  display: flex;
  flex: 0 0 ${({ $compact }) => ($compact ? '40px' : '56px')};
  align-items: center;
  gap: 4px;
  padding: ${({ $compact }) => ($compact ? '0 24px' : '12px 24px')};
  border-top: 1px solid ${theme.color.neutral.separatorSubtle};
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.backgroundMuted};
`;

const Segmented = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  height: 32px;
  padding: 0 3px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.backgroundMuted};
  cursor: pointer;

  > span {
    display: inline-flex;
    cursor: inherit;
  }
`;

const Segment = styled.button<{ $active?: boolean }>`
  position: relative;
  height: 26px;
  padding: 3px 8px;
  border: ${({ $active }) => ($active ? `1px solid ${theme.color.neutral.border}` : '1px solid transparent')};
  border-radius: 4px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;

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

const ModeTabs = styled(Tabs)<{ $stagger?: boolean }>`
  min-width: 0;
  flex: 1;
  height: 40px;

  [role='tablist'] {
    align-items: center;
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

      @media (prefers-reduced-motion: reduce) {
        [role='tab'] {
          opacity: 1;
          animation: none;
          transform: none;
        }
      }
    `}
`;

const DisabledModeTab = styled.button`
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: ${theme.color.neutral.textDisabled};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: not-allowed;

  svg {
    flex: 0 0 16px;
    color: ${theme.color.neutral.iconDisabled};
  }
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
  right: 16px;
  bottom: 16px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 3px;
  height: 48px;
  padding: 4px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.background};
`;

const VariantButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid ${({ $active }) => ($active ? theme.color.neutral.border : 'transparent')};
  border-radius: 4px;
  background: ${({ $active }) => ($active ? theme.color.neutral.backgroundSubtle : 'transparent')};
  color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
  transition-property: background-color, border-color, color;
  transition-duration: 120ms;
  transition-timing-function: ease;

  &:hover {
    background: ${theme.color.neutral.hover};
    color: ${theme.color.neutral.text};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }
`;

const VariantNumber = styled.span`
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 4px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.text};
  font-variant-numeric: tabular-nums;
`;

const Execute = styled(Button)`
  position: absolute;
  top: 12px;
  right: 10px;
`;

const sidebarTopItems = [
  { label: 'Apify Store', Icon: ShoppingBagIcon, selected: true },
  { label: 'Home', Icon: HomeIcon },
  { label: 'Actors', Icon: CodeIcon },
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

const runTabs: TabData[] = [
  { id: 'runs', title: 'Runs', Icon: PlayIcon, to: '#runs' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'integrations', title: 'Integrations', Icon: PuzzleIcon, to: '#integrations' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const serverTabs: TabData[] = [
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const detachedTabs: TabData[] = [
  { id: 'use', title: 'Use', Icon: PlayIcon, to: '#use' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const disabledTabs: TabData[] = [
  { id: 'standby', title: 'Server mode', Icon: StandbyIcon, to: '#standby' },
  { id: 'runs', title: 'Runs', Icon: PlayIcon, to: '#runs' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const variantOptions: Array<{ id: NavigationVariant; number: number; label: string }> = [
  { id: 'inline', number: 1, label: 'Inline' },
  { id: 'split', number: 2, label: 'Dropdown tab' },
  { id: 'detached', number: 3, label: 'Detached' },
  { id: 'disabled', number: 4, label: 'Disabled' },
];

const tabTitles: Record<string, string> = {
  run: 'Run mode',
  server: 'Server mode',
  input: 'Run mode',
  runs: 'Runs',
  requests: 'Requests',
  builds: 'Builds',
  monitoring: 'Monitoring',
  integrations: 'Integrations',
  tasks: 'Saved tasks',
  use: 'Use',
  standby: 'Server mode',
};

const tabRoutes: Record<string, string> = {
  run: 'runs',
  server: 'standby',
  input: 'input',
};

function getDefaultTab(variant: NavigationVariant, mode: Mode, splitMode: SplitMode): string {
  if (variant === 'detached') return 'use';
  if (variant === 'disabled') return 'standby';
  if (variant === 'split') return splitMode;
  return mode;
}

function SidebarItem({
  label,
  Icon,
  selected = false,
}: {
  label: string;
  Icon: IconComponent;
  selected?: boolean;
}) {
  return (
    <NavItem href="#" $selected={selected} onClick={(event) => event.preventDefault()}>
      <Icon size="16" />
      <span>{label}</span>
    </NavItem>
  );
}

function AppSidebar() {
  return (
    <Sidebar aria-label="Apify Console navigation">
      <Account>
        <UserAvatar name="Caroline Yooni Huh" url="/assets/profile.jpeg" size={32} />
        <AccountCopy>
          <AccountName>Caroline Yooni Huh</AccountName>
          <AccountPlan>Personal</AccountPlan>
        </AccountCopy>
        <ChevronDownIcon size="16" />
      </Account>

      <SidebarSearchRow>
        <SearchBox>
          <SearchIcon size="16" />
          <span>Search..</span>
          <Shortcut>⌘⇧K</Shortcut>
        </SearchBox>
        <NotificationButton type="button" aria-label="Notifications">
          <BellIcon size="16" />
        </NotificationButton>
      </SidebarSearchRow>

      <SidebarNav>
        <NavCluster>
          {sidebarTopItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
          <SectionLabel>
            <span>Development</span>
            <ChevronDownIcon size="16" />
          </SectionLabel>
        </NavCluster>
        <NavSpacer />
        <NavCluster>
          {sidebarBottomItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </NavCluster>
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
            aria-label="Help"
            Icon={QuestionMarkIcon}
            size="extraSmall"
            variant={ICON_BUTTON_VARIANTS.BORDERED}
          />
          <IconButton
            aria-label="Collapse sidebar"
            Icon={LayoutSidebarIcon}
            size="extraSmall"
            variant={ICON_BUTTON_VARIANTS.BORDERED}
          />
        </FooterActions>
      </SidebarFooter>
    </Sidebar>
  );
}

function ActorHeader() {
  return (
    <Header>
      <TitleRow>
        <TitleGroup>
          <IconButton aria-label="Go back" Icon={ArrowLeftIcon} size="small" />
          <ActorIdentity>
            <ActorNameGroup>
              <ActorAvatarFrame>
                <ActorAvatar name="Contact Details Scraper" url="/assets/actor.png" size={18} borderRadius={5} />
              </ActorAvatarFrame>
              <ActorTitle>Contact Details Scraper Standby</ActorTitle>
            </ActorNameGroup>
            <IconButton aria-label="Edit Actor" Icon={EditIcon} size="extraSmall" />
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
      </MetaRow>
    </Header>
  );
}

function SegmentedModeControl({
  mode,
  setMode,
  labels,
  tooltips,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  labels: { run: string; server: string };
  tooltips?: { run: string; server: string };
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const nextMode = event.key === 'ArrowRight' || event.key === 'End'
      ? 'server'
      : event.key === 'ArrowLeft' || event.key === 'Home'
        ? 'run'
        : undefined;

    if (!nextMode) return;

    event.preventDefault();
    setMode(nextMode);
    const nextButton = event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelector<HTMLButtonElement>(`[data-mode="${nextMode}"]`);
    nextButton?.focus();
  };

  const renderSegment = (segmentMode: Mode) => {
    const segment = (
      <Segment
        type="button"
        role="tab"
        data-mode={segmentMode}
        aria-selected={mode === segmentMode}
        tabIndex={mode === segmentMode ? 0 : -1}
        $active={mode === segmentMode}
        onClick={() => setMode(segmentMode)}
        onKeyDown={handleKeyDown}
      >
        {labels[segmentMode]}
      </Segment>
    );

    return tooltips ? (
      <Tooltip
        content={tooltips[segmentMode]}
        placement="bottom"
        delayShow={3000}
        showInPortal
      >
        {segment}
      </Tooltip>
    ) : segment;
  };

  return (
    <Segmented role="tablist" aria-label="Actor mode">
      {renderSegment('run')}
      {renderSegment('server')}
    </Segmented>
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
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  variant: NavigationVariant;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;
}) {
  const [staggerMode, setStaggerMode] = useState<Mode>();
  const [staggerSplitMode, setStaggerSplitMode] = useState<SplitMode>();

  useEffect(() => {
    if (variant !== 'inline') setStaggerMode(undefined);
    if (variant !== 'split') setStaggerSplitMode(undefined);
  }, [variant]);

  const selectMode = (nextMode: Mode) => {
    if (nextMode === mode) {
      setActiveTab(nextMode);
      return;
    }

    setStaggerMode(nextMode);
    setActiveTab(nextMode);
    setMode(nextMode);
  };

  const selectTab = ({ id, event }: { id: string; event: React.MouseEvent }) => {
    event.preventDefault();
    setActiveTab(id);
  };

  const selectSplitMode = (nextMode: SplitMode) => {
    if (nextMode === splitMode) {
      setActiveTab(nextMode);
      return;
    }

    setStaggerSplitMode(nextMode);
    setSplitMode(nextMode);
    setActiveTab(nextMode);
  };

  if (variant === 'detached') {
    return (
      <TabsBar $compact>
        <ModeTabs variant="buttoned" tabs={detachedTabs} activeTab={activeTab} onSelect={selectTab} />
      </TabsBar>
    );
  }

  if (variant === 'disabled') {
    return (
      <TabsBar>
        <Tooltip
          content="Run mode is unavailable because Input wasn’t defined in the Actor schema."
          placement="bottom"
          delayShow={200}
          showInPortal
        >
          <DisabledModeTab
            type="button"
            role="tab"
            aria-selected="false"
            aria-disabled="true"
            aria-label="Run mode is unavailable because Input wasn’t defined in the Actor schema"
          >
            <InputIcon size="16" aria-hidden="true" />
            <span>Run mode</span>
          </DisabledModeTab>
        </Tooltip>
        <ModeTabs variant="buttoned" tabs={disabledTabs} activeTab={activeTab} onSelect={selectTab} />
      </TabsBar>
    );
  }

  const tabs = variant === 'split'
    ? splitMode === 'input' ? runTabs : serverTabs
    : mode === 'run' ? runTabs : serverTabs;

  return (
    <TabsBar>
      {variant === 'inline' ? (
        <SegmentedModeControl
          mode={mode}
          setMode={selectMode}
          labels={{ run: 'Run mode', server: 'Server mode' }}
          tooltips={{
            run: 'Run mode uses Apify Input to configure and start Actor runs.',
            server: 'Server mode serves requests from the Actor’s Standby mode.',
          }}
        />
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
              onClick: () => undefined,
            } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
            contentProps={{ side: 'bottom', align: 'start', sideOffset: 4 }}
          >
            <Dropdown.Item selected={splitMode === 'input'} onSelect={() => selectSplitMode('input')}>
              Run mode
            </Dropdown.Item>
            <Dropdown.Item selected={splitMode === 'server'} onSelect={() => selectSplitMode('server')}>
              Server mode
            </Dropdown.Item>
          </DropdownButton>
        </ModeDropdownTab>
      )}
      <ModeTabs
        key={variant === 'inline' ? mode : variant === 'split' ? splitMode : variant}
        $stagger={
          (variant === 'inline' && staggerMode === mode)
          || (variant === 'split' && staggerSplitMode === splitMode)
        }
        variant="buttoned"
        tabs={tabs}
        activeTab={activeTab}
        onSelect={selectTab}
      />
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
}: {
  variant: NavigationVariant;
  mode: Mode;
  setMode: (mode: Mode) => void;
  splitMode: SplitMode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const detached = variant === 'detached';
  const modeLabel = variant === 'split'
    ? splitMode === 'input' ? 'Run mode' : 'Server mode'
    : variant === 'disabled'
      ? 'Server mode'
      : detached
        ? mode === 'run' ? 'Run mode' : 'Server mode'
        : mode === 'run' ? 'Run mode' : 'Server mode';
  const tabTitle = tabTitles[activeTab] ?? 'Content';
  const tabRoute = tabRoutes[activeTab] ?? activeTab;

  const selectDetachedMode = (nextMode: Mode) => {
    setMode(nextMode);
    setActiveTab('use');
  };

  return (
    <Content $detached={detached}>
      <ContentStack>
        {detached && activeTab === 'use' && (
          <DetachedModeRow>
            <SegmentedModeControl
              mode={mode}
              setMode={selectDetachedMode}
              labels={{ run: 'Run mode', server: 'Server mode' }}
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

function VariantSelector({
  variant,
  onSelect,
}: {
  variant: NavigationVariant;
  onSelect: (variant: NavigationVariant) => void;
}) {
  return (
    <VariantDock aria-label="Navigation design options">
      {variantOptions.map((option) => (
        <VariantButton
          key={option.id}
          type="button"
          $active={option.id === variant}
          aria-pressed={option.id === variant}
          aria-label={`Option ${option.number}: ${option.label}`}
          title={`Option ${option.number}: ${option.label}`}
          onClick={() => onSelect(option.id)}
        >
          <VariantNumber>{option.number}</VariantNumber>
          <span>{option.label}</span>
        </VariantButton>
      ))}
    </VariantDock>
  );
}

function PrototypeInner() {
  const [mode, setMode] = useState<Mode>('run');
  const [splitMode, setSplitMode] = useState<SplitMode>('input');
  const [variant, setVariant] = useState<NavigationVariant>('inline');
  const [activeTab, setActiveTab] = useState('run');

  useEffect(() => {
    const option = Number(new URLSearchParams(window.location.search).get('option'));
    const initialVariant = variantOptions.find((item) => item.number === option)?.id;

    if (initialVariant) {
      setVariant(initialVariant);
      setActiveTab(getDefaultTab(initialVariant, mode, splitMode));
    }
  }, []);

  const selectVariant = (nextVariant: NavigationVariant) => {
    setVariant(nextVariant);
    setActiveTab(getDefaultTab(nextVariant, mode, splitMode));

    const url = new URL(window.location.href);
    const option = variantOptions.find((item) => item.id === nextVariant);
    if (option) url.searchParams.set('option', String(option.number));
    window.history.replaceState({}, '', url);
  };

  return (
    <Shell>
      <AppSidebar />
      <MainColumn>
        <ActorHeader />
        <ModeNavigation
          mode={mode}
          setMode={setMode}
          variant={variant}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          splitMode={splitMode}
          setSplitMode={setSplitMode}
        />
        <PlaceholderContent
          variant={variant}
          mode={mode}
          setMode={setMode}
          splitMode={splitMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </MainColumn>
      <VariantSelector variant={variant} onSelect={selectVariant} />
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
