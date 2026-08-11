'use client';

import type { ImgHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';
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
  StandbyIcon,
  StorageIcon,
  TasksIcon,
} from '@apify/ui-icons';
import type { IconComponent } from '@apify/ui-icons';
import {
  ActorAvatar,
  Badge,
  Button,
  CheckboxPrimitive,
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
type OnboardingFlow = 'standby' | 'reshuffle';

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
  padding-left: 26px;
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
  container-name: actor-tabs;
  container-type: inline-size;
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

const Segment = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  position: relative;
  height: 26px;
  padding: 3px 8px;
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

      @media (prefers-reduced-motion: reduce) {
        [role='tab'] {
          opacity: 1;
          animation: none;
          transform: none;
        }
      }
    `}
`;

const FullTabSet = styled.div<{ $collapseAt: number }>`
  display: flex;
  min-width: 0;
  flex: 1;

  @container actor-tabs (max-width: ${({ $collapseAt }) => `${$collapseAt}px`}) {
    display: none;
  }
`;

const ResponsiveOverflowTabSet = styled.div<{ $minWidth: number; $maxWidth: number }>`
  display: none;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 4px;

  @container actor-tabs
    (min-width: ${({ $minWidth }) => `${$minWidth}px`})
    and (max-width: ${({ $maxWidth }) => `${$maxWidth}px`}) {
    display: flex;
  }
`;

const MoreDropdownTab = styled(ModeDropdownTab)`
  flex: 0 0 auto;

  > button {
    color: ${theme.color.neutral.textMuted};
  }
`;

const OverflowVisibleTabs = styled(ModeTabs)`
  width: auto;
  flex: 0 0 auto;
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

const DockDivider = styled.span`
  width: 1px;
  height: 24px;
  margin: 0 3px;
  background: ${theme.color.neutral.separatorSubtle};
`;

const ViewCheckboxLabel = styled.label`
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;

  &:hover {
    background: ${theme.color.neutral.hover};
    color: ${theme.color.neutral.text};
  }

  &:focus-within {
    background: ${theme.color.neutral.backgroundSubtle};
  }
`;

const ViewCheckbox = styled(CheckboxPrimitive)`
  flex: 0 0 auto;
`;

const TenancyDropdownLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

const singleTenantServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Endpoints', Icon: ApiIcon, to: '#endpoints' },
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const createDisabledMultiTenantTab = (tab: TabData): TabData => ({
  ...tab,
  disabled: true,
  'aria-disabled': true,
  'aria-label': `${tab.title} requires Dev mode in Multi-tenant Server mode`,
  tabIndex: -1,
} as TabData);

const multiTenantDevServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Endpoints', Icon: ApiIcon, to: '#endpoints' },
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const multiTenantServerTabs: TabData[] = [
  { id: 'endpoints', title: 'Endpoints', Icon: ApiIcon, to: '#endpoints' },
  { id: 'requests', title: 'Requests', Icon: PlayIcon, to: '#requests' },
  createDisabledMultiTenantTab({ id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' }),
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  createDisabledMultiTenantTab({ id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' }),
];

const detachedTabs: TabData[] = [
  { id: 'use', title: 'Use', Icon: PlayIcon, to: '#use' },
  { id: 'builds', title: 'Builds', Icon: BuildsIcon, to: '#builds' },
  { id: 'monitoring', title: 'Monitoring', Icon: MonitoringIcon, to: '#monitoring' },
  { id: 'tasks', title: 'Saved tasks', Icon: TasksIcon, to: '#tasks' },
];

const disabledServerModeTab: TabData = {
  id: 'standby',
  title: 'Server mode',
  Icon: StandbyIcon,
  to: '#standby',
};

const developerTabs: TabData[] = [
  { id: 'source', title: 'Source', Icon: CodeIcon, to: '#source' },
  { id: 'publishing', title: 'Publishing', Icon: GlobeIcon, to: '#publishing' },
  { id: 'settings', title: 'Settings', Icon: SettingsIcon, to: '#settings' },
];

const developerTabIds = new Set(developerTabs.map(({ id }) => id));

const runModeUnsupportedMessage =
  'This Actor doesn’t support Run mode. Run mode lets you configure Input and start the Actor as a run.';

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
  'actor-input': 'Input',
  runs: 'Runs',
  endpoints: 'Endpoints',
  requests: 'Requests',
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
  source: 'source',
  publishing: 'publishing',
  settings: 'settings',
};

function getDefaultTab(variant: NavigationVariant, mode: Mode, splitMode: SplitMode): string {
  if (variant === 'detached') return 'use';
  if (variant === 'disabled') return 'standby';
  if (variant === 'split') return splitMode === 'input' ? 'actor-input' : 'endpoints';
  return mode === 'run' ? 'actor-input' : 'endpoints';
}

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
          onClick={() => undefined}
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
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  labels: { run: string; server: string };
  tooltips?: { run: string; server: string };
  disabledModes?: Partial<Record<Mode, boolean>>;
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
        content={tooltip}
        placement="bottom"
        delayShow={disabled ? 200 : 3000}
        showInPortal
      >
        {segment}
      </Tooltip>
    ) : segment;
  };

  return (
    <Segmented role="tablist" aria-label="Actor mode" data-flow-target="mode-switcher">
      {renderSegment('run')}
      {renderSegment('server')}
    </Segmented>
  );
}

function OverflowTabs({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: TabData[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const activeOverflowTab = tabs.some(({ id }) => id === activeTab);

  return (
    <MoreDropdownTab $active={activeOverflowTab}>
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
}) {
  const [staggerMode, setStaggerMode] = useState<Mode>();
  const [staggerSplitMode, setStaggerSplitMode] = useState<SplitMode>();

  useEffect(() => {
    if (variant !== 'inline') setStaggerMode(undefined);
    if (variant !== 'split') setStaggerSplitMode(undefined);
  }, [variant]);

  const selectMode = (nextMode: Mode) => {
    if (nextMode === mode) {
      setActiveTab(nextMode === 'run' ? 'actor-input' : 'endpoints');
      return;
    }

    setStaggerMode(nextMode);
    setActiveTab(nextMode === 'run' ? 'actor-input' : 'endpoints');
    setMode(nextMode);
  };

  const selectTab = ({ id, event }: { id: string; event: React.MouseEvent }) => {
    event.preventDefault();
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

  const runOnly = supportsRunMode && !supportsServerMode;
  const serverOnly = !supportsRunMode && supportsServerMode;
  const renderTabs = (tabs: TabData[], key: string, stagger = false, collapseAt = 900) => {
    const adaptiveCollapseAt = devMode
      ? collapseAt + 40
      : Math.max(480, collapseAt - 240);
    const collapseStep = 80;
    const overflowStates = Array.from({ length: Math.max(0, tabs.length - 1) }, (_, index) => {
      const hiddenCount = index + 1;
      const visibleCount = tabs.length - hiddenCount;

      return {
        hiddenCount,
        maxWidth: adaptiveCollapseAt - (hiddenCount - 1) * collapseStep,
        minWidth: visibleCount === 1 ? 0 : adaptiveCollapseAt - hiddenCount * collapseStep + 1,
        visibleTabs: tabs.slice(0, visibleCount),
        overflowTabs: tabs.slice(visibleCount),
      };
    });

    return (
      <>
        <FullTabSet $collapseAt={adaptiveCollapseAt} data-flow-target="operational-tabs">
          <ModeTabs
            key={`${key}:full`}
            $stagger={stagger}
            variant="buttoned"
            tabs={tabs}
            activeTab={activeTab}
            onSelect={selectTab}
          />
        </FullTabSet>
        {overflowStates.map(({ hiddenCount, minWidth, maxWidth, visibleTabs, overflowTabs }) => (
          <ResponsiveOverflowTabSet
            key={`${key}:overflow:${hiddenCount}`}
            $minWidth={minWidth}
            $maxWidth={maxWidth}
            data-flow-target="operational-tabs"
          >
            <OverflowVisibleTabs
              $stagger={stagger}
              variant="buttoned"
              tabs={visibleTabs}
              activeTab={activeTab}
              onSelect={selectTab}
            />
            <OverflowTabs tabs={overflowTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </ResponsiveOverflowTabSet>
        ))}
        {devMode && (
          <ModeTabs
            $right
            data-flow-target="developer-tabs"
            variant="buttoned"
            tabs={developerTabs}
            activeTab={activeTab}
            onSelect={selectTab}
          />
        )}
      </>
    );
  };

  if (runOnly) {
    return (
      <TabsBar>
        {renderTabs(runTabs, 'run-only', false, 840)}
      </TabsBar>
    );
  }

  if (variant === 'detached') {
    return (
      <TabsBar>
        {renderTabs(detachedTabs, 'detached', false, 650)}
      </TabsBar>
    );
  }

  if (variant === 'disabled') {
    const disabledTabs = [disabledServerModeTab, ...serverTabs];

    return (
      <TabsBar>
        <Tooltip
          content={runModeUnsupportedMessage}
          placement="bottom"
          delayShow={200}
          showInPortal
        >
          <DisabledModeTab
            type="button"
            role="tab"
            aria-selected="false"
            aria-disabled="true"
            aria-label={`Run mode. ${runModeUnsupportedMessage}`}
          >
            <InputIcon size="16" aria-hidden="true" />
            <span>Run mode</span>
          </DisabledModeTab>
        </Tooltip>
        {renderTabs(disabledTabs, 'disabled', false, 920)}
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
            run: serverOnly
              ? runModeUnsupportedMessage
              : 'Run mode uses Apify Input to configure and start Actor runs.',
            server: 'Server mode serves requests from the Actor’s Standby mode.',
          }}
          disabledModes={{ run: !supportsRunMode, server: !supportsServerMode }}
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
        variant === 'inline' ? mode : variant === 'split' ? splitMode : variant,
        (
          (variant === 'inline' && staggerMode === mode)
          || (variant === 'split' && staggerSplitMode === splitMode)
        ),
        (variant === 'inline' ? mode === 'run' : splitMode === 'input') ? 1000 : 900,
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
              tooltips={!supportsRunMode ? {
                run: runModeUnsupportedMessage,
                server: 'Server mode serves requests from the Actor’s Standby mode.',
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
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="supports-run-mode"
        label="Run support"
        value={supportsRunMode}
        setValue={setSupportsRunMode}
      />
      <DockCheckbox
        id="supports-server-mode"
        label="Server support"
        value={supportsServerMode}
        setValue={setSupportsServerMode}
      />
      <DropdownButton
        buttonLabel={(
          <TenancyDropdownLabel>
            <span>{multiTenant ? 'Multi-tenant' : 'Single-tenant'}</span>
            <ChevronDownIcon size="16" aria-hidden="true" />
          </TenancyDropdownLabel>
        )}
        width="128px"
        buttonProps={{
          size: 'medium',
          variant: 'tertiary',
          'aria-label': `Tenancy: ${multiTenant ? 'Multi-tenant' : 'Single-tenant'}`,
        } as React.ComponentProps<typeof DropdownButton>['buttonProps']}
        contentProps={{ side: 'top', align: 'end', sideOffset: 4 }}
      >
        <Dropdown.Item selected={!multiTenant} onSelect={() => setMultiTenant(false)}>
          Single-tenant
        </Dropdown.Item>
        <Dropdown.Item selected={multiTenant} onSelect={() => setMultiTenant(true)}>
          Multi-tenant
        </Dropdown.Item>
      </DropdownButton>
      <DockCheckbox id="developer-view" label="Developer" value={devMode} setValue={setDevMode} />
      <DockDivider aria-hidden="true" />
      <DockCheckbox
        id="standby-onboarding-flow"
        label="Flows Standby"
        value={standbyFlowEnabled}
        setValue={setStandbyFlowEnabled}
      />
      <DockCheckbox
        id="reshuffle-onboarding-flow"
        label="Flows Reshuffle"
        value={reshuffleFlowEnabled}
        setValue={setReshuffleFlowEnabled}
      />
    </VariantDock>
  );
}

function PrototypeInner() {
  const [mode, setMode] = useState<Mode>('run');
  const [splitMode, setSplitMode] = useState<SplitMode>('input');
  const [variant, setVariant] = useState<NavigationVariant>('inline');
  const [activeTab, setActiveTab] = useState('actor-input');
  const [standbyFlowEnabled, setStandbyFlowEnabled] = useState(false);
  const [reshuffleFlowEnabled, setReshuffleFlowEnabled] = useState(false);
  const [multiTenant, setMultiTenant] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [supportsRunMode, setSupportsRunMode] = useState(true);
  const [supportsServerMode, setSupportsServerMode] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  useEffect(() => {
    const option = Number(new URLSearchParams(window.location.search).get('option'));
    const initialVariant = variantOptions.find((item) => item.number === option)?.id;

    if (initialVariant) {
      setVariant(initialVariant);
      setActiveTab(getDefaultTab(initialVariant, mode, splitMode));
    }
  }, []);

  useEffect(() => {
    if (!standbyFlowEnabled) return;

    if (variant === 'inline') {
      setMode('server');
      setActiveTab('endpoints');
    } else if (variant === 'split') {
      setSplitMode('server');
      setActiveTab('endpoints');
    } else if (variant === 'detached') {
      setMode('server');
      setActiveTab('use');
    } else {
      setActiveTab('standby');
    }
  }, [standbyFlowEnabled, variant]);

  useEffect(() => {
    if (!reshuffleFlowEnabled) return;

    setVariant('inline');
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
    const serverModeActive = variant === 'disabled'
      || (variant === 'inline' && mode === 'server')
      || (variant === 'split' && splitMode === 'server');

    if (
      nextMultiTenant
      && !devMode
      && serverModeActive
      && (activeTab === 'builds' || activeTab === 'tasks')
    ) {
      setActiveTab('endpoints');
    }

    setMultiTenant(nextMultiTenant);
  };

  const selectDevMode = (nextDevMode: boolean) => {
    const serverModeActive = variant === 'disabled'
      || (variant === 'inline' && mode === 'server')
      || (variant === 'split' && splitMode === 'server');

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
      ) {
        setActiveTab('endpoints');
      }
    }

    setDevMode(nextDevMode);
  };

  const selectRunModeSupport = (supported: boolean) => {
    setSupportsRunMode(supported);
    if (supported || !supportsServerMode) return;

    setMode('server');
    setSplitMode('server');
    setActiveTab(variant === 'detached' ? 'use' : 'endpoints');
  };

  const selectServerModeSupport = (supported: boolean) => {
    setSupportsServerMode(supported);
    if (supported || !supportsRunMode) return;

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

  return (
    <Shell $sidebarCompact={sidebarCompact}>
      <AppSidebar compact={sidebarCompact} onToggle={() => setSidebarCompact((compact) => !compact)} />
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
          multiTenant={multiTenant}
          devMode={devMode}
          supportsRunMode={supportsRunMode}
          supportsServerMode={supportsServerMode}
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
      </MainColumn>
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
      />
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
