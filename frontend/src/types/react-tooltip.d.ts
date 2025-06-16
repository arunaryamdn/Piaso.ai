declare module 'react-tooltip' {
    import * as React from 'react';
    interface ReactTooltipProps {
        id?: string;
        place?: string;
        effect?: string;
        type?: string;
        getContent?: () => React.ReactNode;
        children?: React.ReactNode;
        [key: string]: any;
    }
    export default class ReactTooltip extends React.Component<ReactTooltipProps> { }
} 