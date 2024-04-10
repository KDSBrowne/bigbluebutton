import { useState } from 'react'
import React from 'react'
import {
	HTMLContainer,
	Rectangle2d,
	ShapeUtil,
	TLOnResizeHandler,
	getDefaultColorTheme,
	resizeBox,
} from 'tldraw'
import { cardShapeMigrations } from './card-shape-migrations'
import { cardShapeProps } from './card-shape-props'
import { ICardShape } from './card-shape-types'
import ExternalVideoPlayerContainer from '/imports/ui/components/external-video-player/external-video-player-graphql/component';

export class CardShapeUtil extends ShapeUtil<ICardShape> {
	static override type = 'card' as const
	// [1]
	static override props = cardShapeProps
	// [2]
	static override migrations = cardShapeMigrations

	// [3]
	override isAspectRatioLocked = (_shape: ICardShape) => false
	override canResize = (_shape: ICardShape) => true
	override canBind = (_shape: ICardShape) => true

	// [4]
	getDefaultProps(): ICardShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'black',
		}
	}

	// [5]
	getGeometry(shape: ICardShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	// [6]
    component(shape: ICardShape) {
        const bounds = this.editor.getShapeGeometry(shape).bounds;
        const theme = getDefaultColorTheme({ isDarkMode: this.editor.user.getIsDarkMode() });
        const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
        // Here you might handle the logic to start playing the video within the shape
    };
        // YouTube Video ID for the provided URL
        const videoId = 'ETpT7kBvSUk'; // Extracted from the given URL
        const videoPlayerStyles = {
            width: '100%', // Width relative to the container
            height: '100%', // Height relative to the container
            objectFit: 'contain' // Maintain aspect ratio without cropping
          };
        return (
            <HTMLContainer
                id={shape.id}
                style={{
                    width: `${bounds.width}px`, // Set the width of the container to the width of the shape
                    height: `${bounds.height}px`, // Set 
                    border: '1px solid black',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'all',
                    backgroundColor: theme[shape.props.color].semi,
                    color: theme[shape.props.color].solid,
                }}
            >
<div style={{
    fontSize: '24px', 
    fontWeight: 'bold'
}}>{'External Video Content Frame'}</div>

                {/* Embed YouTube Video */}
                {/* <iframe
                    width="560" // You can adjust the width as needed
                    height="315" // You can adjust the height as needed
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe> */}
                {/* <ExternalVideoPlayerContainer
                    videoUrl={`https://www.youtube.com/embed/${videoId}`}
                    isPresenter={true} // Example: Determine if the current user is the presenter
                    // Additional props as needed...
                />     */}
                {/* Existing Content */}

                <div   
                
                style={{
                    width: `${bounds.width}px`, // Set the width of the container to the width of the shape
                    height: `${bounds.height}px`, // Set 
                    overflow: 'hidden',
                }}
                >
                <ExternalVideoPlayerContainer />
                </div>
    

            </HTMLContainer>
        );
    }

	// [7]
	indicator(shape: ICardShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	// [8]
	override onResize: TLOnResizeHandler<ICardShape> = (shape, info) => {
		return resizeBox(shape, info)
	}
}
/* 
A utility class for the card shape. This is where you define the shape's behavior, 
how it renders (its component and indicator), and how it handles different events.

[1]
A validation schema for the shape's props (optional)
Check out card-shape-props.ts for more info.

[2]
Migrations for upgrading shapes (optional)
Check out card-shape-migrations.ts for more info.

[3]
Letting the editor know if the shape's aspect ratio is locked, and whether it 
can be resized or bound to other shapes. 

[4]
The default props the shape will be rendered with when click-creating one.

[5]
We use this to calculate the shape's geometry for hit-testing, bindings and
doing other geometric calculations. 

[6]
Render method — the React component that will be rendered for the shape. It takes the 
shape as an argument. HTMLContainer is just a div that's being used to wrap our text 
and button. We can get the shape's bounds using our own getGeometry method.
	
- [a] Check it out! We can do normal React stuff here like using setState.
   Annoying: eslint sometimes thinks this is a class component, but it's not.

- [b] You need to stop the pointer down event on buttons, otherwise the editor will
	   think you're trying to select drag the shape.

[7]
Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here

[8]
Resize handler — called when the shape is resized. Sometimes you'll want to do some 
custom logic here, but for our purposes, this is fine.
*/