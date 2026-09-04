'use client';

import { useState } from 'react';
import styled from 'styled-components';

import {
  ApiIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  InputIcon,
  IssuesIcon,
  MenuIcon,
  PeopleIcon,
  PricingIcon,
  RefreshIcon,
  SettingsIcon,
  StarEmptyIcon,
  TasksIcon,
  VerifiedIcon,
} from '@apify/ui-icons';
import type { IconComponent } from '@apify/ui-icons';
import { Button, theme } from '@apify/ui-library';

import { InterfacePanel } from './interface-panel';

/**
 * The public apify.com Actor page, as opposed to the Console one in `actor-info.tsx`.
 * Same Interface tab, different audience: this is the page someone lands on before
 * they have an account, so it is where "what can I call on this thing" gets decided
 * for people who never open Console.
 */
type StoreTabId =
  | 'readme'
  | 'interface'
  | 'pricing'
  | 'service'
  | 'api'
  | 'source'
  | 'reviews'
  | 'issues'
  | 'changelog'
  | 'tasks';

const storeTabs: Array<{ id: StoreTabId; label: string; Icon: IconComponent; badge?: string }> = [
  { id: 'readme', label: 'README', Icon: BookOpenIcon },
  { id: 'interface', label: 'Interface', Icon: InputIcon },
  { id: 'pricing', label: 'Pricing', Icon: PricingIcon },
  { id: 'service', label: 'Service', Icon: SettingsIcon },
  { id: 'api', label: 'API', Icon: ApiIcon },
  { id: 'source', label: 'Source code', Icon: CodeIcon },
  { id: 'reviews', label: 'Reviews', Icon: StarEmptyIcon },
  { id: 'issues', label: 'Issues', Icon: IssuesIcon },
  { id: 'changelog', label: 'Changelog', Icon: MenuIcon },
  { id: 'tasks', label: 'Tasks', Icon: TasksIcon, badge: '3' },
];

const marketingNav = ['Product', 'Solutions', 'Developers', 'Resources', 'Pricing'];

const Page = styled.div`
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  overflow: auto;
  background: ${theme.color.neutral.background};
`;

const Masthead = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 24px;
  padding: 16px 32px;
  background: #12100f;
  color: #fff;
`;

const Wordmark = styled.div`
  display: inline-flex;
  align-items: center;

  /* The asset is the full dark logo; on the dark masthead apify.com uses it in white. */
  img {
    height: 24px;
    filter: brightness(0) invert(1);
  }
`;

const MarketingNav = styled.nav`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: rgb(255 255 255 / 82%);
  font-size: 14px;
  font-weight: 500;
  cursor: default;
`;

const ContactSales = styled.span`
  color: rgb(255 255 255 / 82%);
  font-size: 14px;
  font-weight: 500;
  cursor: default;
`;

const ConsoleButton = styled.span`
  display: inline-flex;
  height: 40px;
  align-items: center;
  padding: 0 18px;
  border-radius: 8px;
  background: #fff;
  color: #12100f;
  font-size: 14px;
  font-weight: 600;
  cursor: default;
`;

const HeroBand = styled.section`
  flex: 0 0 auto;
  padding: 20px 32px 32px;
  background: #12100f;
  color: #fff;
`;

const StoreBack = styled.button`
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 4px;
  }
`;

const HeroRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-top: 24px;
`;

const HeroAvatar = styled.div`
  display: flex;
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff;

  img {
    width: 36px;
    height: 36px;
  }
`;

const HeroCopy = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 8px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.02em;
`;

const HeroId = styled.span`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 6px;
  color: rgb(255 255 255 / 78%);
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  line-height: 20px;
`;

const HeroDescription = styled.p`
  max-width: 760px;
  margin: 8px 0 0;
  color: rgb(255 255 255 / 76%);
  font-size: 15px;
  line-height: 24px;
`;

const Body = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: flex-start;
  gap: 0;
`;

const FactsRail = styled.aside`
  display: flex;
  width: 260px;
  flex: 0 0 260px;
  flex-direction: column;
  border-right: 1px solid ${theme.color.neutral.separatorSubtle};
`;

const FactsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 24px;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
`;

const FactLabel = styled.h2`
  margin: 0;
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const FactValue = styled.div`
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const FactLink = styled.span`
  color: ${theme.color.primary.textInteractive};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-decoration: underline;
  cursor: default;
`;

const Developer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 600;
`;

const DeveloperAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
`;

const MaintainedBy = styled.span`
  display: inline-flex;
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${theme.color.neutral.backgroundSubtle};
  color: ${theme.color.neutral.textMuted};
  font-size: 12px;
  line-height: 18px;
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.color.neutral.textMuted};
  font-size: 13px;
  line-height: 18px;

  strong {
    color: ${theme.color.neutral.text};
    font-weight: 600;
  }
`;

const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Category = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  background: ${theme.color.primary.backgroundSubtle};
  color: ${theme.color.primary.textInteractive};
  font-size: 12px;
  line-height: 18px;
`;

const Main = styled.main`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

const StoreTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 12px 24px;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
`;

const StoreTab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid ${({ $active }) => ($active ? theme.color.neutral.border : 'transparent')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? theme.color.neutral.background : theme.color.neutral.hover)};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }
`;

const TabBadge = styled.span`
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 9px;
  background: ${theme.color.neutral.backgroundSubtle};
  color: ${theme.color.neutral.textMuted};
  font-size: 11px;
  font-weight: 600;
`;

const TabBody = styled.div`
  flex: 1;
  padding: 24px;
`;

const Prose = styled.div`
  width: min(100%, 900px);
  color: ${theme.color.neutral.textMuted};
  font-size: 15px;
  line-height: 24px;
`;

const EmptyTab = styled.div`
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${theme.color.neutral.separatorSubtle};
  border-radius: 8px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.textSubtle};
  font-size: 14px;
`;

export function StorePageView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<StoreTabId>('interface');

  return (
    <Page aria-label="Public store page">
      <Masthead>
        <Wordmark>
          <img src="/assets/apify-logo.svg" alt="Apify" />
        </Wordmark>
        <MarketingNav>
          {marketingNav.map((item) => (
            <NavLink key={item}>
              {item}
              {item !== 'Pricing' && <ChevronDownIcon size="16" aria-hidden="true" />}
            </NavLink>
          ))}
        </MarketingNav>
        <ContactSales>Contact sales</ContactSales>
        <ConsoleButton>Go to Console</ConsoleButton>
      </Masthead>

      <HeroBand>
        <StoreBack type="button" onClick={onBack}>
          <ArrowLeftIcon size="20" aria-hidden="true" />
          <span>Go to Apify Store</span>
        </StoreBack>
        <HeroRow>
          <HeroAvatar>
            <img src="/assets/actor.png" alt="" />
          </HeroAvatar>
          <HeroCopy>
            <HeroTitle>Contact Details Scraper Standby</HeroTitle>
            <HeroId>
              lukas.holona/my-actor-1
              <CopyIcon size="12" aria-hidden="true" />
            </HeroId>
          </HeroCopy>
          <Button size="medium" onClick={onBack}>Try for free</Button>
        </HeroRow>
        <HeroDescription>
          Extract contact details from websites, or call the same Actor as a server and get an
          answer back on the request. Configure it through Input, or point an agent at its
          endpoints and MCP.
        </HeroDescription>
      </HeroBand>

      <Body>
        <FactsRail aria-label="Actor facts">
          <FactsSection>
            <FactLabel>Pricing</FactLabel>
            <FactLink>Pay per event + usage</FactLink>
          </FactsSection>
          <FactsSection>
            <FactLabel>Rating</FactLabel>
            <FactValue>4.6 ★★★★☆ (34)</FactValue>
          </FactsSection>
          <FactsSection>
            <FactLabel>Developer</FactLabel>
            <Developer>
              <DeveloperAvatar src="/assets/author.png" alt="" />
              <span>Lukas Holona</span>
              <VerifiedIcon size="16" color={theme.color.primary.icon} aria-label="Verified developer" />
            </Developer>
            <MaintainedBy>Maintained by community</MaintainedBy>
          </FactsSection>
          <FactsSection>
            <FactLabel>Actor stats</FactLabel>
            <Stats>
              <Stat><BookmarkIcon size="16" aria-hidden="true" /><strong>3.6k</strong> Bookmarked</Stat>
              <Stat><PeopleIcon size="16" aria-hidden="true" /><strong>15k</strong> Total users</Stat>
              <Stat><PeopleIcon size="16" aria-hidden="true" /><strong>2.4k</strong> Monthly active users</Stat>
              <Stat><ClockIcon size="16" aria-hidden="true" /><strong>2 days</strong> Response time</Stat>
              <Stat><RefreshIcon size="16" aria-hidden="true" /><strong>8 days ago</strong> Last modified</Stat>
            </Stats>
          </FactsSection>
          <FactsSection>
            <FactLabel>Categories</FactLabel>
            <Categories>
              <Category>Lead generation</Category>
              <Category>AI</Category>
              <Category>Automation</Category>
            </Categories>
          </FactsSection>
        </FactsRail>

        <Main>
          <StoreTabs role="tablist" aria-label="Actor page sections">
            {storeTabs.map(({ id, label, Icon, badge }) => (
              <StoreTab
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                $active={activeTab === id}
                onClick={() => setActiveTab(id)}
              >
                <Icon size="16" aria-hidden="true" />
                <span>{label}</span>
                {badge && <TabBadge>{badge}</TabBadge>}
              </StoreTab>
            ))}
          </StoreTabs>
          <TabBody>
            {activeTab === 'interface' ? (
              <InterfacePanel />
            ) : activeTab === 'readme' ? (
              <Prose>
                Contact Details Scraper finds structured contact information on websites — email
                addresses, phone numbers, company details and social profiles. Run it over a list of
                URLs and collect the results from a dataset, or keep it up as a server and ask it
                for a single domain on demand.
              </Prose>
            ) : (
              <EmptyTab>{storeTabs.find(({ id }) => id === activeTab)?.label} content</EmptyTab>
            )}
          </TabBody>
        </Main>
      </Body>
    </Page>
  );
}
