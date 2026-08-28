'use client';

import { useState } from 'react';
import styled from 'styled-components';

import {
  ApiIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  InputIcon,
  IssuesIcon,
  MenuIcon,
  PeopleIcon,
  PlayIcon,
  PricingIcon,
  QuestionMarkIcon,
  RefreshIcon,
  StarEmptyIcon,
  VerifiedIcon,
} from '@apify/ui-icons';
import type { IconComponent } from '@apify/ui-icons';
import { Button, theme } from '@apify/ui-library';

type InfoTabId = 'readme' | 'input' | 'pricing' | 'api' | 'issues' | 'reviews' | 'changelog';

const infoTabs: Array<{ id: InfoTabId; label: string; Icon: IconComponent }> = [
  { id: 'readme', label: 'Readme', Icon: BookOpenIcon },
  { id: 'input', label: 'Input', Icon: InputIcon },
  { id: 'pricing', label: 'Pricing', Icon: PricingIcon },
  { id: 'api', label: 'API', Icon: ApiIcon },
  { id: 'issues', label: 'Issues', Icon: IssuesIcon },
  { id: 'reviews', label: 'Reviews', Icon: StarEmptyIcon },
  { id: 'changelog', label: 'Changelog', Icon: MenuIcon },
];

const Page = styled.section`
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: ${theme.color.neutral.background};
`;

const Hero = styled.header`
  flex: 0 0 auto;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.background};
`;

const StoreBack = styled.button`
  display: inline-flex;
  height: 40px;
  align-items: center;
  gap: 4px;
  margin: 8px 16px 0;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;

  &:hover {
    background: ${theme.color.neutral.hover};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }
`;

const HeroBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 32px 16px;
`;

const IdentityRow = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
`;

const StoreActorAvatar = styled.div`
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  place-items: center;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 8px;
  background: ${theme.color.neutral.background};
`;

const StoreActorImage = styled.img`
  display: block;
  width: 38px;
  height: 38px;
  border-radius: 6px;
  object-fit: cover;
  outline: 1px solid rgba(0, 0, 0, 0.1);
`;

const IdentityCopy = styled.div`
  min-width: 0;
  flex: 1;
`;

const StoreActorTitle = styled.h1`
  overflow: hidden;
  margin: 0 0 4px;
  color: ${theme.color.neutral.text};
  font-size: 26px;
  font-weight: 500;
  line-height: 34px;
  text-overflow: ellipsis;
  text-wrap: balance;
  white-space: nowrap;
`;

const StoreActorId = styled.span`
  display: inline-flex;
  height: 20px;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${theme.color.neutral.backgroundSubtle};
  color: ${theme.color.neutral.text};
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const HeroDescription = styled.p`
  max-width: 920px;
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  line-height: 20px;
  text-wrap: pretty;
`;

const Details = styled.div`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
`;

const FactsRail = styled.aside`
  width: 240px;
  flex: 0 0 240px;
  overflow: auto;
  border-right: 1px solid ${theme.color.neutral.separatorSubtle};
  padding-bottom: 72px;
  background: ${theme.color.neutral.background};
`;

const FactsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 32px;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
`;

const FactLabel = styled.h2`
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
`;

const FactValue = styled.div`
  color: ${theme.color.neutral.text};
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
`;

const Developer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const DeveloperAvatar = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  outline: 1px solid rgba(0, 0, 0, 0.1);
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
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  line-height: 16px;

  strong {
    color: ${theme.color.neutral.text};
    font-weight: 600;
  }
`;

const Categories = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Category = styled.span`
  padding: 1px 4px;
  border-radius: 3px;
  background: ${theme.color.primary.backgroundSubtle};
  color: ${theme.color.primary.textInteractive};
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
`;

const BuildSelect = styled.button`
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 6px;
  background: ${theme.color.neutral.background};
  color: ${theme.color.neutral.text};
  font-size: 12px;
  line-height: 16px;
  cursor: pointer;
`;

const DetailMain = styled.main`
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
`;

const DetailTabs = styled.div`
  display: flex;
  min-height: 56px;
  flex: 0 0 56px;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 16px;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.backgroundMuted};
`;

const DetailTab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid ${({ $active }) => ($active ? theme.color.neutral.border : 'transparent')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 12px;
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

const ReadmeScroll = styled.div`
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 24px 32px 88px;
`;

const Readme = styled.article`
  position: relative;
  width: min(100%, 900px);
  color: ${theme.color.neutral.text};
`;

const ReadmeCopy = styled.div`
  width: min(100%, 760px);

  p {
    margin: 0;
    font-size: 16px;
    line-height: 24px;
    text-wrap: pretty;
  }
`;

const ContentsMarker = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  width: 40px;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  span {
    display: block;
    height: 1px;
    background: ${theme.color.neutral.textSubtle};
  }

  span:nth-child(3n + 1) { width: 24px; }
  span:nth-child(3n + 2) { width: 36px; }
  span:nth-child(3n) { width: 30px; }
`;

const VideoPlaceholder = styled.div`
  display: grid;
  width: min(100%, 560px);
  aspect-ratio: 16 / 9;
  place-items: center;
  margin-top: 32px;
  border: 1px solid ${theme.color.neutral.border};
  border-radius: 8px;
  background: #e2e5f3;
  color: ${theme.color.neutral.textOnPrimary};
`;

const EmptyTab = styled.div`
  display: grid;
  min-height: 320px;
  place-items: center;
  border: 1px dashed ${theme.color.neutral.border};
  border-radius: 8px;
  color: ${theme.color.neutral.textSubtle};
  font-size: 14px;
`;

export function ActorInfoView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<InfoTabId>('readme');

  return (
    <Page aria-label="Actor info page">
      <Hero>
        <StoreBack type="button" onClick={onBack}>
          <ArrowLeftIcon size="20" aria-hidden="true" />
          <span>Apify Store</span>
        </StoreBack>
        <HeroBody>
          <IdentityRow>
            <StoreActorAvatar>
              <StoreActorImage src="/assets/actor.png" alt="Contact Details Scraper" />
            </StoreActorAvatar>
            <IdentityCopy>
              <StoreActorTitle>Contact Details Scraper Standby</StoreActorTitle>
              <StoreActorId>
                lukas.holona/my-actor-1
                <CopyIcon size="12" aria-hidden="true" />
              </StoreActorId>
            </IdentityCopy>
            <Button size="medium" onClick={onBack}>Use Actor</Button>
          </IdentityRow>
          <HeroDescription>
            Extract contact details from websites and keep a ready-to-use Server mode endpoint for immediate requests.
            Configure the Actor through Input or use its Server mode directly.
          </HeroDescription>
        </HeroBody>
      </Hero>

      <Details>
        <FactsRail aria-label="Actor facts">
          <FactsSection>
            <FactLabel>Rating</FactLabel>
            <FactValue>4.6 ★ (34)</FactValue>
            <FactLabel>Pricing</FactLabel>
            <FactValue>Pay per event + usage</FactValue>
          </FactsSection>
          <FactsSection>
            <FactLabel>Developer</FactLabel>
            <Developer>
              <DeveloperAvatar src="/assets/author.png" alt="" />
              <span>Lukas Holona</span>
              <VerifiedIcon size="16" color={theme.color.primary.icon} aria-label="Verified developer" />
            </Developer>
          </FactsSection>
          <FactsSection>
            <FactLabel>Actor stats</FactLabel>
            <Stats>
              <Stat><strong>3.6k</strong><BookmarkIcon size="16" aria-hidden="true" /> Bookmarked</Stat>
              <Stat><strong>15k</strong><PeopleIcon size="16" aria-hidden="true" /> Total users</Stat>
              <Stat><strong>96%</strong><CheckIcon size="16" aria-hidden="true" /> Run succeeded</Stat>
              <Stat><strong>2 days</strong><ClockIcon size="16" aria-hidden="true" /> Response time</Stat>
              <Stat><strong>2 months ago</strong><RefreshIcon size="16" aria-hidden="true" /> Last modified</Stat>
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
          <FactsSection>
            <FactLabel>Build <QuestionMarkIcon size="12" aria-label="About builds" /></FactLabel>
            <BuildSelect type="button">Build 1.0.3 (latest)</BuildSelect>
          </FactsSection>
        </FactsRail>

        <DetailMain>
          <DetailTabs role="tablist" aria-label="Actor information sections">
            {infoTabs.map(({ id, label, Icon }) => (
              <DetailTab
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                $active={activeTab === id}
                onClick={() => setActiveTab(id)}
              >
                <Icon size="16" aria-hidden="true" />
                <span>{label}</span>
              </DetailTab>
            ))}
          </DetailTabs>
          <ReadmeScroll>
            {activeTab === 'readme' ? (
              <Readme>
                <ReadmeCopy>
                  <p>
                    Contact Details Scraper is an easy-to-use Actor for finding structured contact information on websites.
                    It extracts email addresses, phone numbers, company details, and social profiles, and stores the results
                    in a dataset ready for export as JSON, XML, or CSV. Configure and run it manually through Input, call it
                    programmatically through the API, or use Server mode when your integration needs an immediate response.
                    Start by adding one or more target URLs, choose the contact fields you need, and run the Actor. The
                    extracted results will appear in storage as soon as they are available.
                  </p>
                </ReadmeCopy>
                <ContentsMarker aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
                </ContentsMarker>
                <VideoPlaceholder aria-label="Actor tutorial video placeholder">
                  <PlayIcon size="40" aria-hidden="true" />
                </VideoPlaceholder>
              </Readme>
            ) : (
              <EmptyTab>{infoTabs.find(({ id }) => id === activeTab)?.label} content</EmptyTab>
            )}
          </ReadmeScroll>
        </DetailMain>
      </Details>
    </Page>
  );
}
