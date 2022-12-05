import React from 'react';
import { defineMessages } from 'react-intl';
import { safeMatch } from '/imports/utils/string-utils';
import { isUrlValid, startWatching } from '/imports/ui/components/external-video-player/service';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';

const intlMessages = defineMessages({
  externalVideo: {
    id: 'app.smartMediaShare.externalVideo',
  },
});

export const SmartLinkShare = (props) => {
    console.log('Smart Link Share', props)
  const {
    currentSlide, intl, isMobile, isRTL, userIsPresenter
  } = props;
  const linkPatt = /(https?:\/\/[^\s]+)/gm;
  const externalLinks = safeMatch(linkPatt, currentSlide?.content?.replace(/[\n]/g, ''), false);
  if (!externalLinks) return null;

  const actions = [];
  externalLinks.forEach((lnk) => {
    console.log('link ', lnk)
    const splitLink = lnk.split('https://');
    console.log('splitLink ', splitLink)
    splitLink.forEach((l) => {
        if (l === '' || isUrlValid(`https://${l}`)) return;
        actions.push({
          label: l,
          onClick: () => window.open(`https://${l}`, '_blank'),
        });
      
    })
  });

  if (actions?.length === 0) return null;

  const customStyles = { top: '-1rem' };

  return (
    <div style={{ position: 'absolute',
        right: userIsPresenter ? '16rem' : '4rem',
        top: '-2px', }}>
    <BBBMenu
      customStyles={!isMobile ? customStyles : null}
      trigger={(
        <Styled.QuickVideoButton
          role="button"
          label={'Links'}
          color="light"
          circle
          icon="external-video"
          size="md"
          onClick={() => null}
          hideLabel
        />
      )}
      actions={actions}
      opts={{
        id: 'external-video-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getContentAnchorEl: null,
        fullwidth: 'true',
        anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
      }}
    />
    </div>
  );
};

export default SmartLinkShare;
