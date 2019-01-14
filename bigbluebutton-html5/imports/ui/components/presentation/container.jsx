import { withTracker } from 'meteor/react-meteor-data';
import { getSwapLayout } from '/imports/ui/components/media/service';
import PresentationAreaService from './service';
import PresentationArea from './component';

const PresentationAreaContainer = withTracker((props) => {
  const { podId } = props;
  const currentSlide = PresentationAreaService.getCurrentSlide(podId);
  const currentPresentation = PresentationAreaService.getCurrentPresentation(podId);
  const multiUser = PresentationAreaService.getMultiUserStatus(
    currentSlide && currentSlide.id,
  ) && !getSwapLayout();

  return {
    currentSlide,
    multiUser,
    userIsPresenter: PresentationAreaService.isPresenter(podId) && !getSwapLayout(),
    toggleFitToWidth: () => PresentationAreaService.toggleFitToWidth(podId, currentPresentation),
    fitToWidth: currentPresentation.fitToWidth,
  };
})(PresentationArea);

export default PresentationAreaContainer;
