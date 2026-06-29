package mk.ukim.finki.timski.coudy.model.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quiz_topics")
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String course;
    private String topic;

    @JsonProperty("source_file")
    private String sourceFile;

    @JsonProperty("total_slides")
    private int totalSlides;

    @Column(columnDefinition = "TEXT")
    private String slidesJson;

    @Column(columnDefinition = "TEXT")
    private String generatedQuestionsJson;

    private LocalDateTime lastGenerated;

    @JsonIgnore
    @Transient
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @JsonProperty("slides")
    public void setSlides(List<Map<String, Object>> slides) {
        if (slides != null) {
            try {
                this.slidesJson = MAPPER.writeValueAsString(slides);
            } catch (JsonProcessingException e) {
                this.slidesJson = "[]";
            }
        }
    }
}