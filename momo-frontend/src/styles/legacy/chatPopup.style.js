import styled, { createGlobalStyle } from "styled-components";

const ChatPopupGlobalStyles = createGlobalStyle`
  .chat-avatar {
    display: block;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
export default ChatPopupGlobalStyles;


export const ChatPanel = styled.section`
  position: fixed;
  right: 20px;
  bottom: 84px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(238,246,240,.48) 58%, rgba(220,233,224,.3));
  box-shadow: 0 18px 48px rgba(34,42,37,.16), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(30px) saturate(170%);
  backdrop-filter: blur(30px) saturate(170%);

  @media (max-width: 600px) {
    max-width: calc(100vw - 32px);
  }
`;

export const ChatHeader = styled.header`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  padding: 13px 14px;
  color: #303B34;
  background: linear-gradient(140deg, rgba(255,255,255,.76), rgba(231,242,234,.48));
  border-bottom: 1px solid rgba(255,255,255,.9);
  box-shadow: inset 0 1px rgba(255,255,255,.98);
  cursor: move;
  user-select: none;
`;

export const ChatHeading = styled.div`
  display: grid;
  gap: 3px;
`;

export const ConnectionStatus = styled.span`
  color: var(--momo-muted);
  font-size: 12px;
`;

export const OnlineCount = styled.span`
  color: var(--momo-text-soft);
  font-size: 12px;
  font-weight: 700;
`;

export const WindowActions = styled.div`
  display: flex;
  gap: 6px;
`;

export const WindowActionButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid rgba(255,255,255,.92);
  border-radius: 10px;
  color: #46554A;
  background: linear-gradient(145deg, rgba(255,255,255,.8), rgba(232,242,235,.46));
  box-shadow: 0 3px 8px rgba(34,42,37,.045), inset 0 1px rgba(255,255,255,1);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  backdrop-filter: blur(16px) saturate(160%);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
  &:hover { border-color: rgba(255,255,255,1); background: rgba(255,255,255,.92); box-shadow: 0 6px 12px rgba(34,42,37,.08), inset 0 1px rgba(255,255,255,1); }
`;

export const MessageList = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px;
`;

export const MessageRow = styled.article`
  display: flex;
  flex-direction: ${({ $isOwn }) => ($isOwn ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 8px;
  margin: 12px 0;
`;

export const Avatar = styled.img`
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

export const AvatarFallback = styled.span`
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 50%;
  color: var(--momo-text-soft);
  background: var(--momo-border);
`;

export const MessageBody = styled.div`
  min-width: 0;
  max-width: 82%;
`;

export const MessageMeta = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: ${({ $isOwn }) => ($isOwn ? "flex-end" : "flex-start")};
  gap: 7px;
  margin: 0 2px 4px;
  color: var(--momo-text-soft);
  font-size: 12px;

  time {
    color: var(--momo-muted);
    font-size: 10px;
  }
`;

export const DeleteButton = styled.button`
  padding: 0;
  border: 0;
  color: var(--momo-muted);
  background: transparent;
  cursor: pointer;
  font-size: 11px;
`;

export const MessageBubble = styled.p`
  margin: 0;
  padding: 9px 12px;
  overflow-wrap: anywhere;
  border-radius: ${({ $isOwn }) => ($isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px")};
  color: ${({ $isDeleted }) => ($isDeleted ? "#777D73" : "#344139")};
  background: ${({ $isOwn, $isDeleted }) => ($isDeleted ? "rgba(235,239,234,.52)" : $isOwn ? "linear-gradient(140deg, rgba(255,255,255,.82), rgba(218,235,222,.5))" : "linear-gradient(140deg, rgba(255,255,255,.82), rgba(241,246,242,.5))")};
  border: 1px solid rgba(255,255,255,.84);
  box-shadow: 0 3px 8px rgba(34,42,37,.035), inset 0 1px rgba(255,255,255,.96);
  -webkit-backdrop-filter: blur(14px) saturate(150%);
  backdrop-filter: blur(14px) saturate(150%);
  line-height: 1.45;
  white-space: pre-wrap;
  font-style: ${({ $isDeleted }) => ($isDeleted ? "italic" : "normal")};
`;

export const MessageImage = styled.img`
  display: block;
  max-width: min(260px, 100%);
  max-height: 240px;
  border-radius: 12px;
  object-fit: contain;
  background: var(--momo-note);
  cursor: zoom-in;
`;

export const ImagePreviewButton = styled.button`
  display: block;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: transparent;
  cursor: zoom-in;
`;

export const ImageModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(20, 16, 12, 0.82);
  cursor: zoom-out;
`;

export const ImageModalContent = styled.img`
  max-width: min(92vw, 1200px);
  max-height: 90vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
`;

export const ImageUploadButton = styled.button`
  flex: 0 0 auto;
  padding: 9px 10px;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 10px;
  color: #46554A;
  background: linear-gradient(145deg, rgba(255,255,255,.8), rgba(232,242,235,.46));
  box-shadow: 0 3px 8px rgba(34,42,37,.045), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
  backdrop-filter: blur(18px) saturate(165%);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const SecondaryButton = styled.button`
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 9px;
  color: #46554A;
  background: linear-gradient(145deg, rgba(255,255,255,.76), rgba(235,243,237,.44));
  box-shadow: 0 3px 8px rgba(34,42,37,.04), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  cursor: pointer;
`;

export const EmptyMessage = styled.p`
  margin: 36px 0;
  color: var(--momo-muted);
  text-align: center;
`;

export const MessageForm = styled.form`
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  min-height: 58px;
  box-sizing: border-box;
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.84);
  background: rgba(246,249,246,.36);
`;

export const MessageInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--momo-border-strong);
  border-radius: 10px;
`;

export const SendButton = styled.button`
  padding: 9px 12px;
  border: 1px solid rgba(255,255,255,.94);
  border-radius: 10px;
  color: #4D421F;
  background: linear-gradient(140deg, rgba(255,255,255,.82), rgba(255,231,151,.6) 48%, rgba(255,212,59,.32));
  box-shadow: 0 4px 10px rgba(92,76,29,.08), inset 0 1px rgba(255,255,255,.98);
  -webkit-backdrop-filter: blur(18px) saturate(165%);
  backdrop-filter: blur(18px) saturate(165%);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const ErrorNotice = styled.p`
  margin: 0;
  padding: 0 12px 12px;
  color: var(--momo-danger);
  font-size: 13px;
`;

export const SuccessNotice = styled.p`
  margin: 0;
  padding: 0 12px 12px;
  color: var(--momo-success);
  font-size: 13px;
`;

export const ResizeHandle = styled.button`
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: nwse-resize;

  &::after {
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 9px;
    height: 9px;
    border-right: 2px solid var(--momo-placeholder);
    border-bottom: 2px solid var(--momo-placeholder);
    content: "";
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

export const ChatLauncher = styled.button.attrs({ className: "momo-chat-launcher" })`
  display: flex;
  align-items: center;
  gap: 8px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1001;
  padding: 13px 18px;
  border: 1px solid rgba(255,255,255,.92);
  border-radius: 24px;
  color: #3D4C41;
  background: linear-gradient(145deg, rgba(255,255,255,.82), rgba(224,239,228,.48) 58%, rgba(210,228,215,.34));
  box-shadow: 0 8px 20px rgba(34,42,37,.12), inset 0 1px rgba(255,255,255,1);
  -webkit-backdrop-filter: blur(24px) saturate(175%);
  backdrop-filter: blur(24px) saturate(175%);
  cursor: pointer;
  transition: box-shadow 200ms ease, border-color 200ms ease, background 200ms ease;
  &:hover { border-color: rgba(255,255,255,1); background: linear-gradient(145deg, rgba(255,255,255,.94), rgba(221,239,226,.64)); box-shadow: 0 11px 25px rgba(34,42,37,.15), inset 0 1px rgba(255,255,255,1); }
`;

export const UnreadBadge = styled.span`
  display: inline-grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  box-sizing: border-box;
  padding: 0 5px;
  border-radius: 10px;
  color: var(--momo-text-soft);
  background: var(--momo-accent);
  font-size: 12px;
  font-weight: 700;
`;

export const ConnectionIndicator = styled.span`
  color: var(--momo-note-strong);
  font-size: 11px;
  font-weight: 400;
`;

