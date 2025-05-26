import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Dropdown from '/imports/ui/components/dropdown/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../../layout/enums';
import { uniqueId, safeMatch } from '/imports/utils/string-utils';
import PollService from '/imports/ui/components/poll/service';
import Session from '/imports/ui/services/storage/in-memory';

const intlMessages = defineMessages({
  quickPollLabel: {
    id: 'app.poll.quickPollTitle',
    description: 'Quick poll button title',
  },
  trueOptionLabel: {
    id: 'app.poll.t',
    description: 'Poll true option value',
  },
  falseOptionLabel: {
    id: 'app.poll.f',
    description: 'Poll false option value',
  },
  yesOptionLabel: {
    id: 'app.poll.y',
    description: 'Poll yes option value',
  },
  noOptionLabel: {
    id: 'app.poll.n',
    description: 'Poll no option value',
  },
  abstentionOptionLabel: {
    id: 'app.poll.abstention',
    description: 'Poll Abstention option value',
  },
  typedRespLabel: {
    id: 'app.poll.userResponse.label',
    description: 'quick poll typed response label',
  },
});

const propTypes = {
  amIPresenter: PropTypes.bool.isRequired,
};

const QuickPollDropdown = (props) => {
  const {
    amIPresenter,
    startPoll,
    stopPoll,
    currentSlide,
    activePoll,
    className,
    layoutContextDispatch,
    pollTypes,
  } = props;

  const intl = useIntl();

  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const MAX_CHAR_LIMIT = POLL_SETTINGS.maxTypedAnswerLength;
  const CANCELED_POLL_DELAY = 250;

  // Utility function to escape special characters for regex
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Function to create a regex pattern
  const createPattern = (v) => new RegExp(`.*(${escapeRegExp(v[0])}\\/${escapeRegExp(v[1])}|${escapeRegExp(v[1])}\\/${escapeRegExp(v[0])}).*`, 'gmi');

  const yesValue = intl.formatMessage(intlMessages.yesOptionLabel);
  const noValue = intl.formatMessage(intlMessages.noOptionLabel);
  const abstentionValue = intl.formatMessage(intlMessages.abstentionOptionLabel);
  const trueValue = intl.formatMessage(intlMessages.trueOptionLabel);
  const falseValue = intl.formatMessage(intlMessages.falseOptionLabel);

  const quickPollOptions = [];
  let {
    content,
  } = currentSlide;

  const questionPattern = /^[a-zA-Z0-9][.)]\s+.*/;
  const yesNoPatt = createPattern([yesValue, noValue]);
  const trueFalsePatt = createPattern([trueValue, falseValue]);
  const optionsPattern = new RegExp(
    [yesNoPatt, trueFalsePatt].map((r) => r.source).join('|'),
    'i',
  );

  const lines = content.split('\n');
  const questionLines = [];
  let isOptionSection = false;
  const options = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (questionPattern.test(trimmed) || optionsPattern.test(trimmed)) {
      isOptionSection = true;
      options.push(trimmed);
    } else if (!isOptionSection && trimmed.length) {
      questionLines.push(trimmed);
    }
  });

  // Join lines into a single question string
  const question = [questionLines.join(' ').trim()];

  // Check explicitly if options exist or if the question ends with '?'
  const hasExplicitQuestionMark = /\?$/.test(question);

  // Process standard lettered options
  const processedOptions = options.filter((o) => questionPattern.test(o)).map((o) => o.replace(/^[a-zA-Z0-9][.)]\s+/, '').trim());

  // Identify Yes/No or True/False options
  const hasYesNo = options.some((o) => /^yes\s*\/\s*no$/i.test(o));
  const hasTrueFalse = options.some((o) => /^true\s*\/\s*false$/i.test(o));

  if (question.length) {
    question[0] = question[0].replace(/\n/g, ' ');
    const urlRegex = /\bhttps?:\/\/\S+\b/g;
    const hasUrl = safeMatch(urlRegex, question[0], '');
    if (hasUrl.length) question.pop();
  }

  const isValidQuestion = (processedOptions.length || hasYesNo || hasTrueFalse)
    || hasExplicitQuestionMark;

  const doubleQuestionRegex = /\?{2}/gm;
  const doubleQuestion = safeMatch(doubleQuestionRegex, content, false);

  const hasYN = safeMatch(yesNoPatt, content, false);
  const hasTF = safeMatch(trueFalsePatt, content, false);

  const pollRegex = /^\s*[1-9A-Za-z][.)]\s+.+$/gm;
  let optionsPoll = safeMatch(pollRegex, content, []);

  const optionsWithLabels = [];
  if (hasYN) {
    optionsPoll = ['yes', 'no'];
  }

  if (optionsPoll) {
    optionsPoll = optionsPoll.map((opt) => {
      const formattedOpt = opt.substring(0, MAX_CHAR_LIMIT);
      optionsWithLabels.push(formattedOpt);
      return `\r${opt[0]}.`;
    });
  }

  optionsPoll.reduce((acc, cur) => {
    const last = acc[acc.length - 1];
    if (!last) {
      acc.push({ options: [cur] });
      return acc;
    }
    const { options: lastOpts } = last;
    const lastOpt = lastOpts[lastOpts.length - 1];
    const lastInt = !!parseInt(lastOpt.charAt(1), 10);
    const curInt = !!parseInt(cur.charAt(1), 10);

    if (lastInt === curInt) {
      if (cur.toLowerCase().charCodeAt(1) > lastOpt.toLowerCase().charCodeAt(1)) lastOpts.push(cur);
      else acc.push({ options: [cur] });
    } else acc.push({ options: [cur] });
    return acc;
  }, []).filter(({ options: ops }) => ops?.length > 1 && ops?.length < 10).forEach((p) => {
    const poll = p;
    if (doubleQuestion) poll.multiResp = true;
    if (poll.options.length <= 5 || MAX_CUSTOM_FIELDS <= 5) {
      const maxAnswer = poll.options.length > MAX_CUSTOM_FIELDS
        ? MAX_CUSTOM_FIELDS
        : poll.options.length;
      quickPollOptions.push({ type: `${pollTypes.Letter}${maxAnswer}`, poll });
    } else quickPollOptions.push({ type: pollTypes.Custom, poll });
  });

  if (
    question.length
    && !optionsPoll.length
    && !doubleQuestion
    && !hasYN
    && !hasTF
    && isValidQuestion
  ) {
    quickPollOptions.push({ type: 'R-', poll: { question: question[0] } });
  }

  if (quickPollOptions.length) content = content.replace(new RegExp(pollRegex), '');

  const ynPoll = PollService.matchYesNoPoll(yesValue, noValue, content);
  const ynaPoll = PollService.matchYesNoAbstentionPoll(yesValue, noValue, abstentionValue, content);
  const tfPoll = PollService.matchTrueFalsePoll(trueValue, falseValue, content);

  ynPoll.forEach((p) => quickPollOptions.push({ type: pollTypes.YesNo, poll: p }));
  ynaPoll.forEach((p) => quickPollOptions.push({ type: pollTypes.YesNoAbstention, poll: p }));
  tfPoll.forEach((p) => quickPollOptions.push({ type: pollTypes.TrueFalse, poll: p }));

  let pollQuestion = '';
  const pollQuestionCandidates = questionLines.filter((l) => l.trim().length);
  const potentialQuestion = [];
  pollQuestionCandidates.some((line) => {
    const trimmed = line.trim();
    if (/^\s*[A-Z0-9][.)]\s+/.test(trimmed)) return true;
    potentialQuestion.push(trimmed);
    return false;
  });

  while (
    potentialQuestion.length > 1
    && !/\?/.test(potentialQuestion[0])
    && (/\bChapter\s*\d+\b/i.test(potentialQuestion[0]) || potentialQuestion[0].includes('|'))
  ) {
    potentialQuestion.shift();
  }

  const combinedText = potentialQuestion
    .join(' ')
    .replace(/ *\([^)]*\) */g, '')
    .trim();
  const tokens = combinedText.split(/\s+/);
  const interrogatives = /^(Which|What|Who|Whose|Whom|Where|When|Why|How)$/i;
  const startIdx = tokens.findIndex((t, i) => i < tokens.length - 1
    && /^[A-Z][a-z]/.test(t)
    && (/^[a-z]/.test(tokens[i + 1]) || interrogatives.test(t)));

  pollQuestion = tokens.slice(startIdx === -1 ? 0 : startIdx).join(' ').trim();

  const typedOrParsedQuestion = question[0] || pollQuestion;
  const slideId = currentSlide.id;

  const handleClickQuickPoll = (d) => {
    d({ type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, value: true });
    d({ type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL, value: PANELS.POLL });
    Session.setItem('forcePollOpen', true);
    Session.setItem('pollInitiated', true);
  };

  const getAvailableQuickPolls = (sId, parsed, fStart, _types, d) => parsed.map((p) => {
    const { type, poll: pData } = p;
    let itemLabel = p.poll;
    const letterAnswers = [];

    if (type === 'R-') {
      return (
        <Dropdown.DropdownListItem
          label={intl.formatMessage(intlMessages.typedRespLabel)}
          key={uniqueId('quick-poll-item')}
          onClick={() => {
            if (activePoll) stopPoll();
            setTimeout(() => {
              handleClickQuickPoll(d);
              fStart(type, sId, letterAnswers, pData?.question);
            }, CANCELED_POLL_DELAY);
          }}
          question={pData?.question}
        />
      );
    }

    if (![_types.YesNo, _types.YesNoAbstention, _types.TrueFalse].includes(type)) {
      const { options: opts } = itemLabel;
      itemLabel = opts.join('/').replace(/[\n.)]/g, '');
      if (type === _types.Custom) {
        for (let i = 0; i < opts.length && letterAnswers.length < MAX_CUSTOM_FIELDS; i += 1) {
          letterAnswers.push(opts[i].replace(/[\r.)]/g, '').toUpperCase());
        }
      }
    }

    itemLabel = itemLabel.replace(/\s+/g, '').toUpperCase();
    const mapNum = {
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I',
    };
    itemLabel = itemLabel.split('').map((c) => mapNum[c] || c).join('');

    return (
      <Dropdown.DropdownListItem
        label={itemLabel}
        key={uniqueId('quick-poll-item')}
        onClick={() => {
          if (activePoll) stopPoll();
          setTimeout(() => {
            handleClickQuickPoll(d);
            fStart(type, sId, letterAnswers, pollQuestion, pData?.multiResp);
          }, CANCELED_POLL_DELAY);
        }}
        answers={letterAnswers}
        multiResp={pData?.multiResp}
      />
    );
  });

  const quickPolls = getAvailableQuickPolls(
    slideId,
    quickPollOptions,
    startPoll,
    pollTypes,
    layoutContextDispatch,
  );
  if (!quickPollOptions.length) return <Styled.QuickPollButtonPlaceholder aria-hidden />;

  let answers = null; let quickPollLabel = ''; let multiResponse = false;
  if (quickPolls.length) {
    const { props: pp } = quickPolls[0];
    quickPollLabel = pp?.label;
    answers = pp?.answers;
    multiResponse = pp?.multiResp;
  }

  let singlePollType = null;
  if (quickPolls.length === 1 && quickPollOptions.length) singlePollType = quickPollOptions[0].type;

  let btn = (
    <Styled.QuickPollButton
      aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
      label={quickPollLabel}
      tooltipLabel={intl.formatMessage(intlMessages.quickPollLabel)}
      onClick={() => {
        if (activePoll) stopPoll();
        setTimeout(() => {
          handleClickQuickPoll(layoutContextDispatch);
          if (singlePollType === 'R-' || singlePollType === 'TF' || singlePollType === 'YN') {
            startPoll(
              singlePollType,
              currentSlide.id,
              answers,
              typedOrParsedQuestion,
              multiResponse,
            );
          } else {
            startPoll(
              pollTypes.Custom,
              currentSlide.id,
              optionsWithLabels,
              pollQuestion,
              multiResponse,
            );
          }
        }, CANCELED_POLL_DELAY);
      }}
      size="lg"
      data-test="quickPollBtn"
      color="primary"
    />
  );

  const usePollDropdown = quickPollOptions.length && quickPolls.length > 1;
  let dropdown = null;

  if (usePollDropdown) {
    btn = (
      <Styled.QuickPollButton
        aria-label={intl.formatMessage(intlMessages.quickPollLabel)}
        label={quickPollLabel}
        tooltipLabel={intl.formatMessage(intlMessages.quickPollLabel)}
        onClick={() => null}
        size="lg"
        data-test="yesNoQuickPoll"
      />
    );
    dropdown = (
      <Dropdown className={className}>
        <Dropdown.DropdownTrigger tabIndex={0}>{btn}</Dropdown.DropdownTrigger>
        <Dropdown.DropdownContent>
          <Dropdown.DropdownList>{quickPolls}</Dropdown.DropdownList>
        </Dropdown.DropdownContent>
      </Dropdown>
    );
  }

  return amIPresenter && usePollDropdown ? dropdown : btn;
};

QuickPollDropdown.propTypes = propTypes;

export default QuickPollDropdown;
