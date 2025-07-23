import React from "react";
import { View, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Callout } from "react-native-maps";
import { useLikes } from "@/hooks/useLikes";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import { TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

const GOOGLE_MAP_ID = "f82519e1511e740e3ff8ca68";

const LikesMapScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const likesQuery = useLikes("", true, 100); // fetch all likes
  const likes =
    likesQuery.data?.pages.flatMap((page) => page.items) || [];

  const mapRef = React.useRef<MapView>(null);
  const [region, setRegion] = React.useState({
    latitude: likes[0]?.latitude ?? 0,
    longitude: likes[0]?.longitude ?? 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  React.useEffect(() => {
    if (likes.length > 0) {
      setRegion((prev) => {
        const lat = likes[0].latitude ?? 0;
        const lng = likes[0].longitude ?? 0;
        if (prev.latitude === lat && prev.longitude === lng) return prev;
        return {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
      });
    }
  }, [likes[0]?.latitude, likes[0]?.longitude]);

  const handleZoom = (zoomIn: boolean) => {
    setRegion((prev) => {
      const factor = zoomIn ? 0.5 : 2;
      return {
        ...prev,
        latitudeDelta: Math.max(0.001, prev.latitudeDelta * factor),
        longitudeDelta: Math.max(0.001, prev.longitudeDelta * factor),
      };
    });
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...region,
        latitudeDelta: Math.max(0.001, region.latitudeDelta * (zoomIn ? 0.5 : 2)),
        longitudeDelta: Math.max(0.001, region.longitudeDelta * (zoomIn ? 0.5 : 2)),
      }, 300);
    }
  };

  // Like item press handler (same as profile-lists)
  const handleLikeItemPress = React.useCallback((item: any) => {
    router.push(`/event-details/${item.id}`);
  }, [router]);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 48,
          left: 16,
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: 24,
          padding: 6,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>

      {/* Zoom In Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 100,
          right: 24,
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: 24,
          padding: 10,
        }}
        onPress={() => handleZoom(true)}
      >
        <Ionicons name="add" size={28} color="#222" />
      </TouchableOpacity>

      {/* Zoom Out Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 40,
          right: 24,
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: 24,
          padding: 10,
        }}
        onPress={() => handleZoom(false)}
      >
        <Ionicons name="remove" size={28} color="#222" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
        region={region}
        zoomEnabled={true}
        minZoomLevel={1}
        maxZoomLevel={20}
        // provider={PROVIDER_GOOGLE}
        // googleMapId={GOOGLE_MAP_ID}
      >
        {likes.map((like) => (
          <Marker
            key={like.id}
            coordinate={{
              latitude: like.latitude ?? 0,
              longitude: like.longitude ?? 0,
            }}
            onPress={() => handleLikeItemPress(like)}
            tracksViewChanges={false}
          >
            <View
              style={{
                minWidth: 60,
                maxWidth: 120,
                paddingVertical: 6,
                paddingHorizontal: 10,
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#222",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="magnet-outline" size={18} color={colors.focus_input} style={{ marginRight: 4 }} />
                <CustomText style={{ fontSize: 15, color: "#222", fontWeight: "bold" }}>
                  {typeof like.similarity === "number" ? `${Math.round(like.similarity * 100)}%` : "N/A"}
                </CustomText>
              </View>
            </View>
            <Callout tooltip>
              <View style={{ width: 0, height: 0, opacity: 0 }} />
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

export default LikesMapScreen;