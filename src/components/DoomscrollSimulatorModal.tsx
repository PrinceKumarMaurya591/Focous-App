import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useFocus } from '../context/FocusContext';
import { triggerHaptic } from '../services/haptics';

const { width } = Dimensions.get('window');

interface MockReel {
  id: string;
  creator: string;
  handle: string;
  title: string;
  dopamineType: string;
  likes: string;
  comments: string;
  colorScheme: [string, string];
}

const MOCK_REELS: MockReel[] = [
  {
    id: 'reel-1',
    creator: 'LifeHacks Daily',
    handle: '@quickhacks',
    title: 'Top 5 gadgets you definitely do not need but will buy anyway 📱',
    dopamineType: 'Instant Curiosity Hook',
    likes: '142K',
    comments: '1,280',
    colorScheme: ['#4C1D95', '#1E1B4B'],
  },
  {
    id: 'reel-2',
    creator: 'Meme Central',
    handle: '@memegod',
    title: 'Me saying "just one more episode" at 3:00 AM on exam night 💀',
    dopamineType: 'Relatable Procrastination',
    likes: '389K',
    comments: '4,120',
    colorScheme: ['#831843', '#4A044E'],
  },
  {
    id: 'reel-3',
    creator: 'Satisfying Kinetic',
    handle: '@kinetic_odd',
    title: 'Uncut slicing kinetic sand in 60 FPS under laser light ✨',
    dopamineType: 'Sensory Trance Loop',
    likes: '890K',
    comments: '6,450',
    colorScheme: ['#064E3B', '#022C22'],
  },
  {
    id: 'reel-4',
    creator: 'Drama Dispatch',
    handle: '@celebspill',
    title: 'You will not believe what they said in yesterday’s podcast 🎙️',
    dopamineType: 'Manufactured Outrage',
    likes: '210K',
    comments: '3,800',
    colorScheme: ['#7C2D12', '#431407'],
  },
];

export const DoomscrollSimulatorModal: React.FC = () => {
  const {
    isDoomscrollModalOpen,
    closeDoomscrollSimulator,
    recordDoomscrollIntercept,
  } = useFocus();

  const [currentReelIndex, setCurrentReelIndex] = useState<number>(0);
  const [swipesCount, setSwipesCount] = useState<number>(1);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [secondsSpent, setSecondsSpent] = useState<number>(0);

  const REEL_LIMIT = 3;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isDoomscrollModalOpen && !isBlocked) {
      interval = setInterval(() => {
        setSecondsSpent((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDoomscrollModalOpen, isBlocked]);

  // Check if limit exceeded
  useEffect(() => {
    if (swipesCount >= REEL_LIMIT && !isBlocked) {
      setIsBlocked(true);
      recordDoomscrollIntercept();
    }
  }, [swipesCount, isBlocked, recordDoomscrollIntercept]);

  if (!isDoomscrollModalOpen) return null;

  const handleNextReel = () => {
    if (swipesCount < REEL_LIMIT) {
      triggerHaptic.light();
      setSwipesCount((prev) => prev + 1);
      setCurrentReelIndex((prev) => (prev + 1) % MOCK_REELS.length);
    } else {
      setIsBlocked(true);
      recordDoomscrollIntercept();
    }
  };

  const handleResetAndClose = () => {
    triggerHaptic.success();
    setIsBlocked(false);
    setSwipesCount(1);
    setCurrentReelIndex(0);
    setSecondsSpent(0);
    closeDoomscrollSimulator();
  };

  const activeReel = MOCK_REELS[currentReelIndex];

  return (
    <Modal
      visible={isDoomscrollModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.container}>
        {/* Top Floating Simulator HUD */}
        <View style={styles.hudOverlay}>
          <View style={styles.hudBadge}>
            <View style={styles.hudLiveDot} />
            <Text style={styles.hudBadgeText}>Reels Simulator</Text>
          </View>

          <View style={styles.meterContainer}>
            <Text style={styles.meterLabel}>
              Doomscroll Budget: {swipesCount}/{REEL_LIMIT} Reels
            </Text>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.min(100, (swipesCount / REEL_LIMIT) * 100)}%`,
                    backgroundColor:
                      swipesCount >= REEL_LIMIT ? Colors.coral : Colors.amber,
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.hudCloseBtn}
            onPress={handleResetAndClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Video / Reel Viewport */}
        {!isBlocked ? (
          <View
            style={[
              styles.reelContent,
              { backgroundColor: activeReel.colorScheme[0] },
            ]}
          >
            {/* Center Visual Mock Video Player */}
            <View style={styles.mockVideoVisual}>
              <View style={styles.playIconRing}>
                <Ionicons name="play" size={36} color="#FFF" />
              </View>
              <View style={styles.dopaminePill}>
                <Ionicons name="flash" size={14} color={Colors.amber} />
                <Text style={styles.dopaminePillText}>{activeReel.dopamineType}</Text>
              </View>
            </View>

            {/* Right Action Rail */}
            <View style={styles.rightActionRail}>
              <View style={styles.actionRailItem}>
                <Ionicons name="heart" size={28} color="#FFF" />
                <Text style={styles.actionRailText}>{activeReel.likes}</Text>
              </View>
              <View style={styles.actionRailItem}>
                <Ionicons name="chatbubble" size={26} color="#FFF" />
                <Text style={styles.actionRailText}>{activeReel.comments}</Text>
              </View>
              <View style={styles.actionRailItem}>
                <Ionicons name="share-social" size={26} color="#FFF" />
                <Text style={styles.actionRailText}>Share</Text>
              </View>
            </View>

            {/* Bottom Reel Details */}
            <View style={styles.reelMetaContainer}>
              <View style={styles.creatorRow}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{activeReel.creator[0]}</Text>
                </View>
                <Text style={styles.creatorName}>{activeReel.creator}</Text>
                <Text style={styles.creatorHandle}>{activeReel.handle}</Text>
              </View>
              <Text style={styles.reelTitle}>{activeReel.title}</Text>
              <Text style={styles.soundtrackText}>
                🎵 Original Audio - Viral Study Lo-fi Remix
              </Text>

              {/* Swipe Up Button */}
              <TouchableOpacity
                style={styles.swipeNextButton}
                onPress={handleNextReel}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-up" size={18} color="#FFF" />
                <Text style={styles.swipeNextButtonText}>
                  Swipe to Next Reel ({REEL_LIMIT - swipesCount} left before intercept)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Doomscroll Interceptor Screen */
          <View style={styles.blockedOverlay}>
            <View style={styles.blockedCard}>
              <View style={styles.blockedIconRing}>
                <Ionicons name="hand-left" size={38} color={Colors.coral} />
              </View>
              <Text style={styles.blockedTitle}>Doomscroll Limit Hit!</Text>
              <Text style={styles.blockedSubtitle}>
                Regain Shield intercepted your feed after {REEL_LIMIT} reels ({secondsSpent}s spent).
              </Text>

              <View style={styles.statReclaimedBox}>
                <Ionicons name="sparkles" size={20} color={Colors.emerald} />
                <View>
                  <Text style={styles.statReclaimedTitle}>+10 Minutes Saved</Text>
                  <Text style={styles.statReclaimedSubtitle}>
                    Saved your evening study streak from an algorithm spiral
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.backToStudyBtn}
                onPress={handleResetAndClose}
                activeOpacity={0.85}
              >
                <Ionicons name="school" size={20} color="#090B10" />
                <Text style={styles.backToStudyBtnText}>
                  Return to Study Mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hudOverlay: {
    position: 'absolute',
    top: 45,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(9, 11, 16, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },
  hudBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  meterContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  meterLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },
  meterTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  hudCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  mockVideoVisual: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 12,
  },
  playIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  dopaminePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  dopaminePillText: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: '600',
  },
  rightActionRail: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 18,
  },
  actionRailItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionRailText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  reelMetaContainer: {
    gap: 8,
    maxWidth: width * 0.8,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#090B10',
    fontWeight: '800',
    fontSize: 14,
  },
  creatorName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  creatorHandle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  reelTitle: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
  },
  soundtrackText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  swipeNextButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeNextButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  blockedOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  blockedCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  blockedIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.coralMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coralGlow,
  },
  blockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  blockedSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statReclaimedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: Colors.emeraldGlow,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    width: '100%',
  },
  statReclaimedTitle: {
    color: Colors.emerald,
    fontSize: 15,
    fontWeight: '700',
  },
  statReclaimedSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  backToStudyBtn: {
    backgroundColor: Colors.emerald,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  backToStudyBtnText: {
    color: '#090B10',
    fontSize: 15,
    fontWeight: '800',
  },
});
