import type { Meeting } from '../../core/types/schemas';
import type { NotionPage, PageProperties } from '../../core/types/notion';
import type { MeetingType, Cadence } from '../../core/constants/databases';
import { BaseRepository } from './base.repository';
import { DATABASE_IDS } from '../../core/constants/databases';

/**
 * Input for creating a new meeting
 */
export interface CreateMeetingInput {
  name: string;
  type: MeetingType;
  cadence?: Cadence | null;
  date?: string | null;
  attendeeTeamIds?: string[];
  actionItemTaskIds?: string[];
  projectIds?: string[];
  teamIds?: string[];
}

/**
 * Input for updating a meeting
 */
export interface UpdateMeetingInput {
  name?: string;
  type?: MeetingType;
  cadence?: Cadence | null;
  date?: string | null;
  attendeeTeamIds?: string[];
  actionItemTaskIds?: string[];
  projectIds?: string[];
  teamIds?: string[];
}

/**
 * Repository for Meeting entities
 */
export class MeetingRepository extends BaseRepository<
  Meeting,
  CreateMeetingInput,
  UpdateMeetingInput
> {
  constructor(mcp: any) {
    super(mcp, DATABASE_IDS.MEETINGS);
  }

  protected getEntityName(): string {
    return 'Meeting';
  }

  protected toDomainEntity(page: NotionPage): Meeting {
    const props = page.properties;

    return {
      id: page.id,
      name: this.extractTitle(props, 'Name'),
      type: (this.extractSelect(props, 'Type') as MeetingType) || 'Ad Hoc',
      cadence: this.extractSelect(props, 'Cadence') as Cadence | null,
      date: this.extractDate(props, 'Date'),
      attendeeTeamIds: this.extractRelation(props, 'Attendees'),
      actionItemTaskIds: this.extractRelation(props, 'Action Items'),
      projectIds: this.extractRelation(props, 'Projects'),
      teamIds: this.extractRelation(props, 'Teams'),
    };
  }

  protected toNotionProperties(
    input: CreateMeetingInput | UpdateMeetingInput | Meeting
  ): PageProperties {
    const properties: PageProperties = {};

    if ('name' in input && input.name !== undefined) {
      properties['Name'] = {
        title: [{ text: { content: input.name } }],
      };
    }

    if ('type' in input && input.type !== undefined) {
      properties['Type'] = {
        select: { name: input.type },
      };
    }

    if ('cadence' in input) {
      properties['Cadence'] = input.cadence
        ? { select: { name: input.cadence } }
        : { select: null };
    }

    if ('date' in input) {
      properties['Date'] = input.date ? { date: { start: input.date } } : { date: null };
    }

    if ('attendeeTeamIds' in input && input.attendeeTeamIds) {
      properties['Attendees'] = {
        relation: input.attendeeTeamIds.map((id) => ({ id })),
      };
    }

    if ('actionItemTaskIds' in input && input.actionItemTaskIds) {
      properties['Action Items'] = {
        relation: input.actionItemTaskIds.map((id) => ({ id })),
      };
    }

    if ('projectIds' in input && input.projectIds) {
      properties['Projects'] = {
        relation: input.projectIds.map((id) => ({ id })),
      };
    }

    if ('teamIds' in input && input.teamIds) {
      properties['Teams'] = {
        relation: input.teamIds.map((id) => ({ id })),
      };
    }

    return properties;
  }

  /**
   * Note: Query methods like findByType, findByTeam, findByProject,
   * findByCadence, findByDateRange, findUpcoming, findPast, and
   * findWithActionItems are removed.
   *
   * These methods required executing queries and filtering results,
   * which violates the declarative control layer principle.
   *
   * Use findMany() with appropriate filters to generate query intents,
   * then execute and process results externally.
   */
}
}
