'use client';

import { useState } from 'react';
import styled from 'styled-components';

import { ApiIcon, InputIcon, McpIcon } from '@apify/ui-icons';
import { theme } from '@apify/ui-library';

/**
 * The Interface tab, shared by the Console Actor-info page and the public store page.
 *
 * Today the store page splits this tab into "Description" and "JSON example" — both
 * views of the input schema, because input is the only interface an Actor has. An
 * Actor server has a second one, so the split moves up a level: Input and Server.
 * Server is the same content option 3 keeps inside its Server tab — the endpoints
 * and the MCP section — reaching the public page rather than only Console.
 */
export type InterfaceSection = 'input' | 'server';

const sections: Array<{ id: InterfaceSection; label: string }> = [
  { id: 'input', label: 'Input' },
  { id: 'server', label: 'Server' },
];

const inputFields = [
  {
    name: 'Start URLs',
    key: 'startUrls',
    required: true,
    description: 'Websites to scan for contact details. Each entry can be a homepage or a deep link; the Actor follows same-domain links from there.',
    facts: [['Type', 'array']],
  },
  {
    name: 'Maximum pages',
    key: 'maxPages',
    required: false,
    description: 'How many pages to visit per domain before returning what has been found so far.',
    facts: [['Type', 'integer'], ['Minimum', '1'], ['Maximum', '100'], ['Default', '10']],
  },
  {
    name: 'Contact fields',
    key: 'contactFields',
    required: false,
    description: 'Which details to extract. Leave empty to collect every supported field.',
    facts: [['Type', 'array'], ['Default', 'emails, phones, socials']],
  },
];

const endpoints = [
  {
    method: 'GET',
    path: '/search',
    description: 'Look up contact details for one domain and return them in the response.',
  },
  {
    method: 'POST',
    path: '/extract',
    description: 'Submit a batch of URLs and stream contact records back as they are found.',
  },
  {
    method: 'GET',
    path: '/health',
    description: 'Readiness probe. Returns 200 once the server can accept traffic.',
  },
];

const mcpTools = [
  { name: 'search_contacts', description: 'Find contact details for a domain.' },
  { name: 'extract_contacts', description: 'Extract contacts from a list of URLs.' },
];

const Panel = styled.div`
  display: flex;
  width: min(100%, 900px);
  flex-direction: column;
  gap: 16px;
`;

const SectionTabs = styled.div`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid ${theme.color.neutral.separatorSubtle};
  border-radius: 8px;
  background: ${theme.color.neutral.backgroundMuted};
`;

const SectionTab = styled.button<{ $active: boolean }>`
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? theme.color.neutral.background : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? `0 1px 2px ${theme.color.neutral.separatorSubtle}` : 'none')};
  color: ${({ $active }) => ($active ? theme.color.neutral.text : theme.color.neutral.textMuted)};
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;

  &:hover {
    color: ${theme.color.neutral.text};
  }

  &:focus-visible {
    outline: 2px solid ${theme.color.primary.fieldBorderActive};
    outline-offset: 2px;
  }
`;

const Card = styled.section`
  overflow: hidden;
  border: 1px solid ${theme.color.neutral.separatorSubtle};
  border-radius: 8px;
`;

const CardHead = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid ${theme.color.neutral.separatorSubtle};
  background: ${theme.color.neutral.backgroundMuted};
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${theme.color.neutral.text};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const Mono = styled.code`
  display: inline-flex;
  height: 22px;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  background: ${theme.color.neutral.backgroundSubtle};
  color: ${theme.color.neutral.textMuted};
  font-family: var(--font-mono), monospace;
  font-size: 12px;
  line-height: 16px;
`;

const Requirement = styled.span<{ $required?: boolean }>`
  color: ${({ $required }) => ($required ? theme.color.neutral.text : theme.color.neutral.textSubtle)};
  font-size: 12px;
  font-weight: ${({ $required }) => ($required ? 600 : 400)};
  line-height: 16px;
`;

const Method = styled.span<{ $post?: boolean }>`
  display: inline-flex;
  height: 22px;
  min-width: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: ${({ $post }) => ($post ? theme.color.primary.backgroundSubtle : theme.color.neutral.backgroundSubtle)};
  color: ${({ $post }) => ($post ? theme.color.primary.text : theme.color.neutral.textMuted)};
  font-family: var(--font-mono), monospace;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
`;

const CardBody = styled.div`
  padding: 12px 16px;
  color: ${theme.color.neutral.textMuted};
  font-size: 13px;
  line-height: 20px;
`;

const Facts = styled.dl`
  display: flex;
  margin: 12px 0 0;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12px;
  line-height: 16px;

  div {
    display: inline-flex;
    gap: 4px;
  }

  dt {
    color: ${theme.color.neutral.textSubtle};
  }

  dd {
    margin: 0;
    color: ${theme.color.neutral.text};
    font-weight: 500;
  }
`;

const GroupHead = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: ${theme.color.neutral.text};
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
`;

const GroupNote = styled.p`
  margin: 0 0 4px;
  color: ${theme.color.neutral.textMuted};
  font-size: 13px;
  line-height: 20px;
`;

const BaseUrl = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px dashed ${theme.color.neutral.separatorSubtle};
  border-radius: 8px;
  background: ${theme.color.neutral.backgroundMuted};
  color: ${theme.color.neutral.textSubtle};
  font-size: 12px;
  line-height: 16px;
`;

export function InterfacePanel({
  section,
  onSelectSection,
}: {
  section?: InterfaceSection;
  onSelectSection?: (section: InterfaceSection) => void;
} = {}) {
  const [internal, setInternal] = useState<InterfaceSection>('input');
  const active = section ?? internal;
  const select = onSelectSection ?? setInternal;

  return (
    <Panel>
      <SectionTabs role="group" aria-label="Interface sections">
        {sections.map(({ id, label }) => {
          const Icon = id === 'input' ? InputIcon : ApiIcon;

          return (
            <SectionTab
              key={id}
              type="button"
              aria-pressed={active === id}
              $active={active === id}
              onClick={() => select(id)}
            >
              <Icon size="16" aria-hidden="true" />
              <span>{label}</span>
            </SectionTab>
          );
        })}
      </SectionTabs>

      {active === 'input' ? (
        <>
          <GroupNote>
            What the Actor accepts when you configure and start a run.
          </GroupNote>
          {inputFields.map(({ name, key, required, description, facts }) => (
            <Card key={key}>
              <CardHead>
                <CardTitle>{name}</CardTitle>
                <Mono>{key}</Mono>
                <Requirement $required={required}>{required ? 'Required' : 'Optional'}</Requirement>
              </CardHead>
              <CardBody>
                {description}
                <Facts>
                  {facts.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}:</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </Facts>
              </CardBody>
            </Card>
          ))}
        </>
      ) : (
        <>
          <GroupNote>
            What the Actor answers while it runs as a server, without starting a run per request.
          </GroupNote>
          <BaseUrl>
            <span>Base URL</span>
            <Mono>https://lukas-holona--my-actor-1.apify.actor</Mono>
          </BaseUrl>

          <GroupHead>
            <ApiIcon size="16" aria-hidden="true" />
            Endpoints
          </GroupHead>
          {endpoints.map(({ method, path, description }) => (
            <Card key={path}>
              <CardHead>
                <Method $post={method === 'POST'}>{method}</Method>
                <Mono>{path}</Mono>
              </CardHead>
              <CardBody>{description}</CardBody>
            </Card>
          ))}

          <GroupHead>
            <McpIcon size="16" aria-hidden="true" />
            MCP
          </GroupHead>
          <GroupNote>
            The same server, described for agents. Point an MCP client at the URL below.
          </GroupNote>
          <BaseUrl>
            <span>Server URL</span>
            <Mono>https://lukas-holona--my-actor-1.apify.actor/mcp</Mono>
          </BaseUrl>
          {mcpTools.map(({ name, description }) => (
            <Card key={name}>
              <CardHead>
                <Mono>{name}</Mono>
              </CardHead>
              <CardBody>{description}</CardBody>
            </Card>
          ))}
        </>
      )}
    </Panel>
  );
}
