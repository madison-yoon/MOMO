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
  border: 1px solid var(--momo-border);
  border-radius: 16px;
  background: var(--momo-surface);
  box-shadow: 0 12px 36px rgba(35, 28, 18, 0.22);

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
  color: var(--momo-text);
  background: var(--momo-bg);
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
  color: var(--momo-text);
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
  border: 0;
  border-radius: 10px;
  color: var(--momo-text);
  background: var(--momo-surface);
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
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
  color: var(--momo-text);
  background: var(--momo-note);
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
  color: var(--momo-text);
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
  color: ${({ $isOwn, $isDeleted }) => ($isDeleted ? "var(--momo-muted)" : $isOwn ? "var(--momo-text)" : "var(--momo-text)")};
  background: ${({ $isOwn, $isDeleted }) => ($isDeleted ? "var(--momo-note)" : $isOwn ? "var(--momo-note)" : "var(--momo-surface)")};
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
  background: var(--momo-surface);
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
  border: 1px solid var(--momo-border);
  border-radius: 10px;
  color: var(--momo-text);
  background: var(--momo-bg);
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
  border: 0;
  border-radius: 9px;
  color: var(--momo-text);
  background: var(--momo-note);
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
  border-top: 1px solid var(--momo-border);
`;

export const MessageInput = styled.input`
  background: var(--momo-bg);
  color: var(--momo-text);
  &::placeholder { color: var(--momo-muted); }
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid var(--momo-border);
  border-radius: 10px;
`;

export const SendButton = styled.button`
  padding: 9px 12px;
  border: 0;
  border-radius: 10px;
  color: var(--momo-on-primary);
  background: var(--momo-primary);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const ErrorNotice = styled.p`
  margin: 0;
  padding: 0 12px 12px;
  color: var(--momo-error);
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
    border-right: 2px solid var(--momo-muted);
    border-bottom: 2px solid var(--momo-muted);
    content: "";
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

export const ChatLauncher = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1001;
  padding: 13px 18px;
  border: 0;
  border-radius: 24px;
  color: var(--momo-text);
  background: var(--momo-surface);
  cursor: pointer;
`;

export const UnreadBadge = styled.span`
  display: inline-grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  box-sizing: border-box;
  padding: 0 5px;
  border-radius: 10px;
  color: var(--momo-text);
  background: var(--momo-accent);
  font-size: 12px;
  font-weight: 700;
`;

export const ConnectionIndicator = styled.span`
  color: var(--momo-text);
  font-size: 11px;
  font-weight: 400;
`;

